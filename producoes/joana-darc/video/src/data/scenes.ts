// scenes.ts — "Quem foi ela? | Gigantes da Humanidade #2" (Joana d'Arc, nome em mistério até a s17)
// Roteiro v1 APROVADO (2026-11-12); cortes derivados da voz real (utils/timing.ts).
//
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local da palavra i (base 0) da fala sN. Linha do tempo determinística.
//
// FIO CONDUTOR: a viagem dela no mapa-maquete do norte da França (1429); a rota roxa avança estação por estação.
// RÉGUA: mapa esquemático; dentro das estações 1 m = U = 0,04 u3d (data/places.ts). Pessoas/mascote só nas estações.
// MISTÉRIO: "ela" é silhueta com "?" até s17 (her.reveal). Nome, "Donzela", Domrémy e rosto proibidos antes disso.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { loc, MS, ST, type Station } from "./places";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-historia", language: "pt-BR" };

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
const key = (at: number, pose: { position: Vec3; target: Vec3 }, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
/** segura a pose até `at - 1` e corta seco para `next` em `at` (evita a câmera "varrer" o mapa entre estações) */
const cut = (at: number, hold: { position: Vec3; target: Vec3 }, next: { position: Vec3; target: Vec3 }): CameraKey[] => [key(at - 1, hold), key(at, next)];
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");

/** Alvo de câmera numa estação (metros locais; y em metros acima do chão). */
const T = (st: Station, x = 0, z = 0, y = 1): Vec3 => loc(st, x, z, y);
const MAP_C: Vec3 = [1.2, 0.12, 0.2];
const P = {
  // s1
  heroOrl: orbit(T("orleans", -10, 28, 1.8), 1.0, 14, 9),
  heroOrl2: orbit(T("orleans", -10, 28, 2.0), 1.3, 0, 11),
  pyre: orbit(T("pyre", 0, 0, 3), 0.95, 12, 8),
  mapAll: orbit(MAP_C, 46, 0, 50),
  mapAll2: orbit(MAP_C, 52, 4, 54),
  // s2/s4 vilarejo
  village: orbit(T("village", 0, 0, 3), 5.4, 22, 22),
  villageHer: orbit(T("village", -3, 9, 1.2), 0.9, -12, 8),
  mapTerr: orbit([0.6, 0.12, 0.6], 40, 0, 58),
  // s3 Chinon
  throne: orbit(T("chinon", 0, -2.5, 1.6), 0.75, 18, 12),
  throneWide: orbit(T("chinon", 0, -1, 2), 1.7, 26, 20),
  crownMap: orbit([-2.2, 0.12, 0.6], 22, 0, 52),
  // s4
  mission: orbit([1.2, 0.12, 0.3], 26, 0, 55),
  // s5/s6 Vaucouleurs
  gate: orbit(T("vaucouleurs", 0, 15, 3), 2.6, 72, 14),
  gate2: orbit(T("vaucouleurs", 0, 14, 3), 2.3, 58, 14),
  // s6 viagem (o alvo acompanha os cavaleiros: interpolado entre estas chaves)
  ride0: orbit(T("vaucouleurs", 0, 20, 1.5), 1.6, 80, 12),
  ride1: orbit([1.0, 0.16, 1.8], 1.6, 80, 12),
  ride2: orbit(T("chinon", 6, 20, 1.5), 1.6, 80, 12),
  // s7 Chinon salão
  court1: orbit(T("chinon", 0, 0, 2), 2.3, 26, 26),
  court2: orbit(T("chinon", 0, 1, 1.4), 1.3, 20, 14),
  court3: orbit(T("chinon", 0, 1, 1.4), 1.2, 58, 14),
  // s8–s10 Orléans
  orlWide: orbit(T("orleans", 0, 14, 4), 4.6, 15, 36),
  orlMap: orbit(T("orleans", 0, 20, 0), 13, 0, 55),
  loire: orbit(T("orleans", -12, 28, 2), 2.7, -28, 16),
  loire2: orbit(T("orleans", -8, 26, 2), 3.0, -48, 20),
  arrow: orbit(T("orleans", -10, 29, 1.4), 0.55, 30, 6),
  orlFree: orbit(T("orleans", 0, 12, 4), 4.4, 22, 30),
  banner: orbit(T("orleans", -10, 29, 1.6), 0.6, 18, 4),
  banner2: orbit(T("orleans", -10, 29, 1.5), 0.48, 34, 2),
  // s11 Reims
  reimsMap: orbit([1.2, 0.12, 0.2], 18, 0, 50),
  cathedral: orbit(T("reims", 0, 6, 9), 3.2, 10, 8),
  cathedral2: orbit(T("reims", 0, 7, 3), 2.0, 18, 8),
  // s12 Compiègne
  bridge: orbit(T("compiegne", 0, 8, 3), 2.7, 25, 16),
  captiveMap: orbit([-1.2, 0.12, -3.3], 12, 0, 55),
  // s13/s14 tribunal
  courtR: orbit(T("rouen", 0, 0, 2), 3.2, 15, 34),
  courtR2: orbit(T("rouen", 0, 1, 1.5), 2.3, 8, 28),
  courtClose: orbit(T("rouen", 0, 3.4, 1.5), 0.62, 4, 8),
  courtClose2: orbit(T("rouen", 0, 3.4, 1.5), 0.55, -6, 8),
  // s15 fogueira
  market: orbit(T("pyre", 0, 2, 3), 2.6, 18, 16),
  market2: orbit(T("pyre", 0, 2, 4), 3.6, 24, 20),
  // s16–s18
  dawnMap: orbit([0.2, 0.12, -1.2], 20, 0, 52),
  statue: orbit(T("paris", 0, 0, 4), 0.95, 12, 8),
  statueHer: orbit(T("paris", 0, 4.2, 1.4), 0.62, 6, 4),
  statueHer2: orbit(T("paris", 0, 4.2, 1.5), 0.5, 2, 3),
  final: orbit(MAP_C, 44, 6, 48),
  final2: orbit(MAP_C, 50, -4, 46),
};

/** câmera lateral que acompanha o cavaleiro da frente (mesma conta do componente Riders) */
function rideKeys(a: number, b: number): CameraKey[] {
  const A = loc("vaucouleurs", 0, 20);
  const B = loc("chinon", 6, 20);
  const out: CameraKey[] = [];
  for (let t = a; t <= b; t += 20) {
    const x = (Math.min(t, b) - a) / (b - a);
    const p: Vec3 = [A[0] + (B[0] - A[0]) * x, A[1] + 0.05, A[2] + (B[2] - A[2]) * x];
    out.push(key(Math.min(t, b), orbit(p, 1.3, 27, 14), "linear"));
  }
  return out;
}

// mascote: um só, "teletransportado" para a estação de cada cena (sempre ao lado da ação)
const M = (st: Station, x: number, z: number): Vec3 => loc(st, x, z, 0);

const O = {
  map: { id: "map", type: "mapa-maquete do norte da França (Natural Earth) + estações em miniatura", visible: true },
  her: { id: "her", type: "ELA: silhueta com contorno roxo e '?' até a s17", visible: true },
  mascot: { id: "mascot", type: "mascote visitante (teletransporta entre estações)", visible: true },
};
const base = [O.map, O.mascot];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Ela tinha dezessete anos, não sabia ler, e convenceu um príncipe a lhe dar um exército. Dois anos depois, foi queimada viva. Quem foi ela? Este é o Gigantes da Humanidade.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.heroOrl), ...cut(W("s1", 16), P.heroOrl2, P.pyre), ...cut(W("s1", 22), orbit(T("pyre", 0, 0, 3), 1.1, 18, 10), P.mapAll), key(end(0), P.mapAll2, "linear")] },
    objects: [...base, O.her, { id: "army", type: "6 soldados franceses atrás dela", visible: true }, { id: "pyre", type: "fogueira em Ruão", visible: true }],
    animations: [
      lin("army.show", W("s1", 15) - 6, W("s1", 15) + 14, 0, 1, "out"),
      lin("fire.level", W("s1", 16), W("s1", 16) + 20, 0, 1, "out"),
      ...fx.desaturate(W("s1", 16), W("s1", 22), 0.55),
      ...fx.shake(W("s1", 20), 14),
      pop("her.qmark", W("s1", 22)),
      lin("series.card", W("s1", 25), W("s1", 25) + 10, 0, 1, "out"),
      popOut("series.card", end(0) - 10),
      ...mascot.place(M("orleans", -12.4, 27.8), 0.5, MS, 0),
      ...mascot.wave(W("s1", 4), 36),
      ...mascot.hide(W("s1", 16) - 2, 1),
    ],
    badges: [
      { text: "17 ANOS · NÃO SABIA LER", variant: "warning", appearAt: W("s1", 1), disappearAt: W("s1", 16) - 2 },
      { text: "QUEIMADA VIVA", subtitle: "dois anos depois", variant: "negative", appearAt: W("s1", 19), disappearAt: W("s1", 22) - 2 },
      { text: "QUEM FOI ELA?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 22), disappearAt: W("s1", 25) - 2 },
    ],
    highlights: ["DEZESSETE", "EXÉRCITO", "QUEIMADA", "VIVA", "QUEM", "GIGANTES", "HUMANIDADE"],
    captions: [cap("s1", 0, "Ela tinha dezessete anos, não sabia ler, e convenceu um príncipe a lhe dar um exército. Dois anos depois, foi queimada viva. Quem foi ela? Este é o Gigantes da Humanidade.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.6), sfx("thud", W("s1", 16), 0.5), sfx("fire", W("s1", 16), 0.3), sfx("shimmer", W("s1", 25), 0.35)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Tudo começa num vilarejo da França, por volta de 1412, em plena Guerra dos Cem Anos. Os ingleses e seus aliados dominavam metade do país.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.village), key(W("s2", 11), orbit(T("village", 0, 0, 3), 5.0, 32, 24)), key(c(1, W("s2", 11) + 45), P.mapTerr, "inOut"), key(end(1), orbit([0.6, 0.12, 0.6], 38, 4, 58), "linear")] },
    objects: [...base, { id: "village", type: "vilarejo sem nome", visible: true }, O.her, { id: "territory", type: "manchas de 1429", visible: true }],
    animations: [
      set("fire.level", 0, 0), set("her.qmark", 0, 1),
      ...fx.whipIn(1, 8),
      pop("year.1412", W("s2", 9)),
      lin("territory.english", W("s2", 16), W("s2", 16) + 40, 0, 1),
      lin("territory.french", W("s2", 21), W("s2", 21) + 30, 0, 1),
      pop("seal.map", W("s2", 12)),
      ...mascot.place(M("village", -6, 10), 0.6, MS, 0),
      ...mascot.wave(W("s2", 2), 30),
    ],
    badges: [
      { text: "POR VOLTA DE 1412", variant: "info", appearAt: W("s2", 9), disappearAt: W("s2", 12) - 2 },
      { text: "GUERRA DOS CEM ANOS", subtitle: "1337–1453 · França × Inglaterra", variant: "info", appearAt: W("s2", 12) },
    ],
    highlights: ["VILAREJO", "1412", "GUERRA", "CEM", "INGLESES", "METADE"],
    captions: [cap("s2", 1, "Tudo começa num vilarejo da França, por volta de 1412, em plena Guerra dos Cem Anos. Os ingleses e seus aliados dominavam metade do país.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.45), sfx("rumble-soft", W("s2", 16), 0.35)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "E o herdeiro do trono, Carlos, nem tinha sido coroado: um tratado prometia a coroa ao rei inglês.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.throne), key(W("s3", 10) - 1, P.throneWide), key(W("s3", 10), P.crownMap), key(end(2), orbit([-2.2, 0.12, 0.6], 20, 4, 52), "linear")] },
    objects: [...base, { id: "charles", type: "Carlos sem coroa", visible: true }, { id: "crown", type: "coroa que voa para o lado inglês", visible: true }],
    animations: [
      lin("charles.slump", W("s3", 6), W("s3", 6) + 20, 0, 1),
      pop("treaty.show", W("s3", 11)),
      lin("crown.float", W("s3", 12), c(2, W("s3", 12) + 55), 0, 1, "inOut"),
      ...fx.whipIn(-1, 7),
      ...mascot.place(M("chinon", -3.2, -2.4), 0.6, MS, 0),
      ...mascot.look(W("s3", 6), -0.6),
    ],
    badges: [
      { text: "HERDEIRO SEM COROA", variant: "negative", appearAt: W("s3", 5), disappearAt: W("s3", 10) - 2 },
      { text: "TRATADO DE TROYES", subtitle: "1420: coroa prometida ao rei inglês", variant: "info", appearAt: W("s3", 11) },
    ],
    highlights: ["HERDEIRO", "CARLOS", "COROADO", "TRATADO", "COROA", "INGLÊS"],
    captions: [cap("s3", 2, "E o herdeiro do trono, Carlos, nem tinha sido coroado: um tratado prometia a coroa ao rei inglês.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.35), sfx("clunk", W("s3", 11), 0.45), sfx("whoosh-soft", W("s3", 12), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Aos treze anos, ela disse ouvir uma voz de Deus. A missão: expulsar os ingleses e levar Carlos para ser coroado.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.villageHer), key(W("s4", 10) - 1, orbit(T("village", -3, 9, 1.3), 0.8, -2, 14)), key(W("s4", 10), orbit([1.6, 0.12, 0.2], 24, 0, 55)), key(end(3), P.mission, "linear")] },
    objects: [...base, O.her, { id: "beam", type: "raio de luz", visible: true }, { id: "mission", type: "rota tracejada vilarejo → Orléans → Reims", visible: true }],
    animations: [
      set("crown.float", 0, 0), set("charles.slump", 0, 0),
      lin("voice.beam", W("s4", 6), W("s4", 6) + 22, 0, 1, "out"),
      lin("voice.beam", W("s4", 10) - 4, W("s4", 10), undefined, 0, "in"),
      lin("mission.draw", W("s4", 11), c(3, W("s4", 20) + 6), 0, 1, "inOut"),
      pop("label.orleans", W("s4", 12)),
      pop("label.reims", W("s4", 16)),
      popOut("label.orleans", end(3) - 4, 4), popOut("label.reims", end(3) - 4, 4),
      ...mascot.place(M("village", -5.2, 8), 0.8, MS, 0),
      ...mascot.look(W("s4", 6), 0.5),
    ],
    badges: [
      { text: "AOS 13 ANOS: UMA VOZ DE DEUS", subtitle: "relato dela no julgamento", variant: "info", appearAt: W("s4", 1), disappearAt: W("s4", 10) - 2 },
      { text: "MISSÃO: EXPULSAR · COROAR", variant: "positive", appearAt: W("s4", 11) },
    ],
    highlights: ["TREZE", "VOZ", "DEUS", "MISSÃO", "EXPULSAR", "COROADO"],
    captions: [cap("s4", 3, "Aos treze anos, ela disse ouvir uma voz de Deus. A missão: expulsar os ingleses e levar Carlos para ser coroado.")],
    audioCues: [narration("s4"), sfx("shimmer", W("s4", 6), 0.4), sfx("whoosh-soft", W("s4", 11), 0.3)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Só que ela era uma camponesa. Pediu uma escolta ao capitão da cidade vizinha, e ele a mandou de volta para casa.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.gate), key(end(4), P.gate2, "linear")] },
    objects: [...base, O.her, { id: "gate", type: "portão de Vaucouleurs", visible: true }, { id: "captain", type: "capitão", visible: true }],
    animations: [
      set("mission.draw", 0, 0),
      ...fx.whipIn(1, 7),
      lin("her.walk", 0, W("s5", 8), 0, 1, "linear"),
      lin("captain.point", W("s5", 17), W("s5", 17) + 10, 0, 1, "out"),
      lin("gate.close", W("s5", 18), W("s5", 18) + 18, 0, 1, "in"),
      ...fx.punch(W("s5", 19), 10),
      pop("label.vaucouleurs", 4), popOut("label.vaucouleurs", W("s5", 6)),
      ...mascot.place(M("vaucouleurs", -4.5, 15), 0.7, MS, 0),
      ...mascot.jump(W("s5", 17)),
    ],
    badges: [
      { text: "CAMPONESA, SEM ESCOLTA", variant: "negative", appearAt: W("s5", 5), disappearAt: W("s5", 15) },
      { text: "\"VOLTE PARA CASA\"", variant: "negative", appearAt: W("s5", 17) },
    ],
    highlights: ["CAMPONESA", "ESCOLTA", "CAPITÃO", "VOLTA", "CASA"],
    captions: [cap("s5", 4, "Só que ela era uma camponesa. Pediu uma escolta ao capitão da cidade vizinha, e ele a mandou de volta para casa.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.35), sfx("clunk", W("s5", 18) + 16, 0.55)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Ela voltou e insistiu até ele ceder. Vestida de homem, cruzou terras inimigas com seis soldados até o castelo do herdeiro.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.gate2), key(W("s6", 7) - 1, orbit(T("vaucouleurs", 0, 14, 3), 2.2, 52, 14)), ...rideKeys(W("s6", 7), end(5))] },
    objects: [...base, O.her, { id: "riders", type: "7 cavaleiros na rota até Chinon", visible: true }],
    animations: [
      set("her.walk", 0, 1), set("captain.point", 0, 0),
      lin("her.insist", 0, W("s6", 3), 0, 1, "linear"),
      lin("gate.close", W("s6", 5), W("s6", 5) + 18, 1, 0, "out"),
      set("her.male", W("s6", 7), 1),
      lin("riders.x", W("s6", 7), end(5), 0, 1, "linear"),
      lin("sky.night", W("s6", 7), W("s6", 7) + 25, 0, 1),
      lin("route.draw", W("s6", 7), end(5), 0, 2, "linear", "u3d"),
      ...mascot.place(M("vaucouleurs", -4.5, 15), 0.7, MS, 0),
      ...mascot.hide(W("s6", 7) - 1, 1),
    ],
    badges: [
      { text: "INSISTIU · ESCOLTA DE 6", variant: "positive", appearAt: W("s6", 3), disappearAt: W("s6", 10) },
      { text: "TERRAS INIMIGAS", variant: "warning", appearAt: W("s6", 11) },
    ],
    highlights: ["VOLTOU", "INSISTIU", "HOMEM", "INIMIGAS", "SEIS", "CASTELO"],
    captions: [cap("s6", 5, "Ela voltou e insistiu até ele ceder. Vestida de homem, cruzou terras inimigas com seis soldados até o castelo do herdeiro.")],
    audioCues: [narration("s6"), sfx("clunk", W("s6", 5), 0.4), sfx("gallop", W("s6", 7), 0.4)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Carlos desconfiou e mandou teólogos interrogarem ela por semanas. Não acharam nada de errado. Ela ganhou armadura, estandarte e um lugar no exército.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.court1), key(W("s7", 14), P.court2, "inOut"), key(end(6), P.court3, "inOut")] },
    objects: [...base, O.her, { id: "theologians", type: "4 teólogos em roda", visible: true }, { id: "charles", type: "Carlos no trono", visible: true }],
    animations: [
      set("sky.night", 0, 0), set("riders.x", 0, 1), set("gate.close", 0, 0),
      ...fx.whipIn(-1, 7),
      pop("theologians.show", W("s7", 3)),
      pop("qmarks.show", W("s7", 5)),
      lin("qmarks.solve", W("s7", 9), W("s7", 9) + 12, 0, 1),
      set("her.armor", 0, 0),
      set("her.armor", W("s7", 16), 1),
      lin("armor.flash", W("s7", 16), W("s7", 16) + 18, 1, 0, "out"),
      lin("banner.raise", W("s7", 17), W("s7", 17) + 20, 0, 1, "out"),
      ...fx.flash(W("s7", 16), 10),
      popOut("qmarks.show", W("s7", 14)),
      ...mascot.place(M("chinon", -4.5, -1.5), 0.8, MS, 0),
      ...mascot.cheer(W("s7", 17), 40),
    ],
    badges: [
      { text: "INTERROGADA POR SEMANAS", variant: "warning", icon: "?", appearAt: W("s7", 4), disappearAt: W("s7", 14) - 2 },
      { text: "ARMADURA · ESTANDARTE · EXÉRCITO", variant: "positive", appearAt: W("s7", 16) },
    ],
    highlights: ["TEÓLOGOS", "SEMANAS", "ERRADO", "ARMADURA", "ESTANDARTE", "EXÉRCITO"],
    captions: [cap("s7", 6, "Carlos desconfiou e mandou teólogos interrogarem ela por semanas. Não acharam nada de errado. Ela ganhou armadura, estandarte e um lugar no exército.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.35), sfx("clunk", W("s7", 16), 0.4), sfx("shimmer", W("s7", 16), 0.45)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "O alvo era Orléans, cercada pelos ingleses havia meses. Se a cidade caísse, o caminho para o resto da França ficava aberto.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.orlWide), key(W("s8", 9), orbit(T("orleans", 0, 14, 4), 4.2, 25, 34)), key(c(7, W("s8", 9) + 40), P.orlMap, "inOut"), key(end(7), orbit(T("orleans", 0, 20, 0), 14, 4, 56), "linear")] },
    objects: [...base, { id: "orleans", type: "Orléans cercada", visible: true }, { id: "bastilles", type: "3 bastilhas inglesas", visible: true }],
    animations: [
      set("her.armor", 0, 1), set("banner.raise", 0, 1),
      ...fx.whipIn(1, 8),
      lin("siege.ring", W("s8", 4), W("s8", 4) + 30, 0, 1, "out"),
      lin("arrows.south", W("s8", 12), W("s8", 12) + 30, 0, 1),
      pop("label.orleans", 6), popOut("label.orleans", end(7) - 6, 6),
      ...mascot.place(M("orleans", -6, 30), 0.3, MS, 0),
      ...mascot.jump(W("s8", 4)),
    ],
    badges: [
      { text: "ORLÉANS CERCADA", subtitle: "desde outubro de 1428", variant: "negative", appearAt: W("s8", 3), disappearAt: W("s8", 9) - 2 },
      { text: "SE CAIR, O SUL FICA ABERTO", variant: "warning", appearAt: W("s8", 12) },
    ],
    highlights: ["ORLÉANS", "CERCADA", "MESES", "CAÍSSE", "ABERTO"],
    captions: [cap("s8", 7, "O alvo era Orléans, cercada pelos ingleses havia meses. Se a cidade caísse, o caminho para o resto da França ficava aberto.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.4), sfx("rumble-soft", W("s8", 4), 0.35), sfx("strain", W("s8", 12), 0.25)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Ela chegou no fim de abril de 1429. Os franceses tomaram os fortes ingleses um a um. Ela levou uma flechada e voltou para a luta. Em nove dias, o cerco acabou.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.loire), key(W("s9", 17) - 1, P.loire2), key(W("s9", 17), P.arrow), key(W("s9", 26) - 1, orbit(T("orleans", -10, 29, 1.5), 0.62, 10, 6)), key(W("s9", 26), P.orlFree), key(end(8), orbit(T("orleans", 0, 12, 4), 4.8, 34, 32), "linear")] },
    objects: [...base, O.her, { id: "convoy", type: "comboio entrando", visible: true }, { id: "forts", type: "fortes caindo", visible: true }],
    animations: [
      set("siege.ring", 0, 1), set("arrows.south", 0, 0),
      lin("route.draw", 0, W("s9", 7), 2, 3, "linear", "u3d"),
      lin("convoy.enter", 0, W("s9", 8), 0, 1, "linear"),
      lin("forts.fall", W("s9", 10), W("s9", 16) + 6, 0, 3, "linear", "u3d"),
      lin("arrow.hit", W("s9", 20), W("s9", 20) + 5, 0, 1, "in"),
      ...fx.shake(W("s9", 20), 14),
      lin("her.down", W("s9", 20), W("s9", 20) + 8, 0, 1, "out"),
      lin("her.down", W("s9", 22), W("s9", 22) + 16, 1, 0, "out"),
      lin("day", W("s9", 26), W("s9", 30), 1, 9, "linear", "u3d"),
      set("day.show", 0, 0),
      set("day.show", W("s9", 26), 1),
      set("day.show", end(8) - 6, 0),
      ...fx.flash(W("s9", 31), 12),
      ...fx.burst("free", W("s9", 31)),
      ...mascot.place(M("orleans", -13, 27), 0.6, MS, 0),
      ...mascot.jump(W("s9", 20)),
      ...mascot.place(M("orleans", -4, 25), 0.2, MS, W("s9", 26)),
      ...mascot.cheer(W("s9", 31), 40),
    ],
    badges: [
      { text: "FIM DE ABRIL DE 1429", variant: "info", appearAt: W("s9", 1), disappearAt: W("s9", 17) - 2 },
      { text: "FERIDA POR FLECHA", variant: "warning", appearAt: W("s9", 20), disappearAt: W("s9", 26) - 2 },
      { text: "CERCO ACABOU EM 9 DIAS", subtitle: "8 de maio de 1429", variant: "positive", appearAt: W("s9", 26) },
    ],
    highlights: ["ABRIL", "1429", "FORTES", "FLECHADA", "VOLTOU", "NOVE", "ACABOU"],
    captions: [cap("s9", 8, "Ela chegou no fim de abril de 1429. Os franceses tomaram os fortes ingleses um a um. Ela levou uma flechada e voltou para a luta. Em nove dias, o cerco acabou.")],
    audioCues: [narration("s9"), sfx("crumble", W("s9", 11), 0.35), sfx("crumble", W("s9", 14), 0.35), sfx("thud", W("s9", 20), 0.55), sfx("tick", W("s9", 26), 0.35), sfx("final", W("s9", 31), 0.3)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "E ela nem lutava de espada: no julgamento, disse que carregava o estandarte para não matar ninguém.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.banner), key(end(9), P.banner2, "linear")] },
    objects: [...base, O.her, { id: "compare", type: "cartões espada ✖ × estandarte ✔", visible: true }],
    animations: [
      set("forts.fall", 0, 3), set("her.down", 0, 0), set("arrow.hit", 0, 0),
      pop("compare.sword", W("s10", 5)),
      pop("compare.banner", W("s10", 12)),
      ...mascot.place(M("orleans", -12.2, 28.2), 0.9, MS, 0),
      ...mascot.point(W("s10", 12), 40, -1.6),
    ],
    badges: [{ text: "ESTANDARTE, NÃO ESPADA", subtitle: "relato dela no julgamento de 1431", variant: "info", appearAt: W("s10", 7) }],
    highlights: ["ESPADA", "JULGAMENTO", "ESTANDARTE", "NINGUÉM"],
    captions: [cap("s10", 9, "E ela nem lutava de espada: no julgamento, disse que carregava o estandarte para não matar ninguém.")],
    audioCues: [narration("s10"), sfx("pop", W("s10", 5), 0.35), sfx("pop", W("s10", 12), 0.35)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Depois, abriu caminho até Reims, a cidade onde os reis franceses eram coroados. Em julho de 1429, Carlos virou rei, com ela ao lado.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.reimsMap), key(W("s11", 13) - 1, orbit([1.6, 0.12, -0.6], 16, 4, 50)), key(W("s11", 13), P.cathedral), key(end(10), P.cathedral2, "inOut")] },
    objects: [...base, O.her, { id: "cathedral", type: "catedral de Reims", visible: true }, { id: "charles", type: "Carlos coroado", visible: true }],
    animations: [
      set("compare.sword", 0, 0), set("compare.banner", 0, 0),
      ...fx.whipIn(1, 8),
      lin("route.draw", 0, W("s11", 6), 3, 4, "inOut", "u3d"),
      pop("label.reims", W("s11", 4)), popOut("label.reims", W("s11", 13) - 2, 2),
      lin("crown.lower", W("s11", 18), W("s11", 18) + 30, 0, 1, "out"),
      ...fx.flash(W("s11", 19), 12),
      ...fx.burst("crown", W("s11", 19)),
      lin("cathedral.glow", W("s11", 19), W("s11", 19) + 20, 0, 1),
      ...mascot.place(M("reims", -4.6, 8.2), 0.5, MS, 0),
      ...mascot.wave(W("s11", 19), 40),
    ],
    badges: [
      { text: "REIMS: CIDADE DAS COROAÇÕES", variant: "info", appearAt: W("s11", 4), disappearAt: W("s11", 13) - 2 },
      { text: "CARLOS COROADO", subtitle: "17 de julho de 1429", variant: "positive", appearAt: W("s11", 18) },
    ],
    highlights: ["REIMS", "COROADOS", "JULHO", "1429", "REI"],
    captions: [cap("s11", 10, "Depois, abriu caminho até Reims, a cidade onde os reis franceses eram coroados. Em julho de 1429, Carlos virou rei, com ela ao lado.")],
    audioCues: [narration("s11"), sfx("whoosh", 0, 0.35), sfx("bells", W("s11", 18), 0.45), sfx("shimmer", W("s11", 19), 0.35)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "Mas a sorte virou. Em maio de 1430, ela foi capturada numa batalha e vendida aos ingleses.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.bridge), key(W("s12", 13) - 1, orbit(T("compiegne", 0, 9, 3), 2.5, 35, 18)), key(W("s12", 13), P.captiveMap), key(end(11), orbit([-1.2, 0.12, -3.3], 11, 4, 55), "linear")] },
    objects: [...base, O.her, { id: "drawbridge", type: "ponte levadiça de Compiègne", visible: true }, { id: "captors", type: "soldados borgonheses", visible: true }],
    animations: [
      set("crown.lower", 0, 1), set("cathedral.glow", 0, 0),
      ...fx.whipIn(-1, 7),
      lin("route.draw", 0, 20, 4, 5, "inOut", "u3d"),
      lin("drawbridge.raise", W("s12", 2), W("s12", 2) + 24, 0, 1, "inOut"),
      lin("captors.close", W("s12", 8), W("s12", 8) + 18, 0, 1, "out"),
      lin("captive.draw", W("s12", 14), c(11, W("s12", 16) + 20), 0, 1, "inOut"),
      ...fx.desaturate(W("s12", 8), end(11), 0.4),
      pop("label.compiegne", 4), popOut("label.compiegne", W("s12", 13) - 2, 2),
      ...mascot.place(M("compiegne", -6, 9), 0.7, MS, 0),
      ...mascot.jump(W("s12", 10)),
    ],
    badges: [
      { text: "CAPTURADA", subtitle: "23 de maio de 1430", variant: "negative", appearAt: W("s12", 9), disappearAt: W("s12", 13) - 2 },
      { text: "VENDIDA AOS INGLESES", variant: "negative", appearAt: W("s12", 13) },
    ],
    highlights: ["SORTE", "VIROU", "1430", "CAPTURADA", "VENDIDA"],
    captions: [cap("s12", 11, "Mas a sorte virou. Em maio de 1430, ela foi capturada numa batalha e vendida aos ingleses.")],
    audioCues: [narration("s12"), sfx("strain", W("s12", 2), 0.35), sfx("chains", W("s12", 9), 0.4)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "Num tribunal da Igreja, dezenas de homens estudados tentaram provar que as vozes eram mentira. Perguntaram se ela estava na graça de Deus. Se dissesse sim, era arrogância. Se dissesse não, confessava culpa.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.courtR), key(W("s13", 15), P.courtR2, "inOut"), key(end(12), orbit(T("rouen", 0, 2, 1.5), 1.9, 0, 24), "linear")] },
    objects: [...base, O.her, { id: "court", type: "tribunal de Ruão", visible: true }, { id: "trap", type: "armadilha SIM/NÃO (2D)", visible: true }],
    animations: [
      set("drawbridge.raise", 0, 0), set("captors.close", 0, 0),
      lin("bg.dim", 0, 30, 0, 0.6),
      lin("court.fill", 0, W("s13", 7), 0, 1, "out"),
      pop("question.show", W("s13", 15)),
      pop("trap.yes", W("s13", 23)),
      ...fx.punch(W("s13", 27), 10),
      pop("trap.no", W("s13", 28)),
      ...fx.punch(W("s13", 32), 10),
      ...mascot.place(M("rouen", -6.5, 4.5), 0.8, MS, 0),
      ...mascot.look(W("s13", 23), -0.5),
      ...mascot.look(W("s13", 28), 0.5),
    ],
    badges: [
      { text: "JULGADA POR HERESIA", subtitle: "tribunal da Igreja · Ruão, 1431", variant: "negative", appearAt: W("s13", 1), disappearAt: W("s13", 15) - 2 },
    ],
    highlights: ["TRIBUNAL", "IGREJA", "MENTIRA", "GRAÇA", "SIM", "ARROGÂNCIA", "NÃO", "CULPA"],
    captions: [cap("s13", 12, "Num tribunal da Igreja, dezenas de homens estudados tentaram provar que as vozes eram mentira. Perguntaram se ela estava na graça de Deus. Se dissesse sim, era arrogância. Se dissesse não, confessava culpa.")],
    audioCues: [narration("s13"), sfx("murmur", 0, 0.22), sfx("buzz", W("s13", 27), 0.35), sfx("buzz", W("s13", 32), 0.35)],
  },
  {
    id: "s14", ...sc(13), voKey: "s14",
    narration: "Ela respondeu: se não estou, que Deus me coloque nela. Se estou, que Deus me mantenha. Sem saber ler, deixou os juízes sem saída.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.courtClose), key(W("s14", 16) - 1, P.courtClose2), key(W("s14", 16), orbit(T("rouen", 0, 0, 2), 3.0, 18, 30)), key(end(13), orbit(T("rouen", 0, 0, 2), 3.3, 28, 32), "linear")] },
    objects: [...base, O.her, { id: "quote", type: "citação (2D)", visible: true }, { id: "trap", type: "terceira saída ✔", visible: true }],
    animations: [
      set("question.show", 0, 1), set("trap.yes", 0, 1), set("trap.no", 0, 1), set("bg.dim", 0, 0.6), set("court.fill", 0, 1),
      lin("her.spot", 0, 20, 0, 1),
      pop("quote.l1", W("s14", 2)),
      pop("quote.l2", W("s14", 10)),
      lin("trap.third", W("s14", 15), W("s14", 15) + 18, 0, 1, "out"),
      ...fx.flash(W("s14", 15), 10),
      lin("judges.freeze", W("s14", 19), W("s14", 19) + 10, 0, 1),
      popOut("quote.l1", W("s14", 16) - 2, 6), popOut("quote.l2", W("s14", 16) - 2, 6),
      popOut("trap.yes", W("s14", 16) - 2, 6), popOut("trap.no", W("s14", 16) - 2, 6), popOut("question.show", W("s14", 16) - 2, 6),
      popOut("trap.third", end(13) - 8, 8),
      ...mascot.place(M("rouen", -6.5, 4.5), 0.8, MS, 0),
      ...mascot.cheer(W("s14", 19), 36),
    ],
    badges: [
      { text: "SEM SABER LER", subtitle: "deixou os juízes sem saída", variant: "positive", appearAt: W("s14", 16) },
    ],
    highlights: ["COLOQUE", "MANTENHA", "SEM", "LER", "SAÍDA"],
    captions: [cap("s14", 13, "Ela respondeu: se não estou, que Deus me coloque nela. Se estou, que Deus me mantenha. Sem saber ler, deixou os juízes sem saída.")],
    audioCues: [narration("s14"), sfx("shimmer", W("s14", 15), 0.45), sfx("ding", W("s14", 19), 0.3)],
  },
  {
    id: "s15", ...sc(14), voKey: "s15",
    narration: "Mesmo assim, foi condenada, também por voltar a usar roupas de homem. Em 30 de maio de 1431, foi queimada viva em Ruão. Tinha dezenove anos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.market), key(end(14), P.market2, "inOut")] },
    objects: [...base, O.her, { id: "pyre", type: "fogueira sóbria: estaca, fogo e fumaça, sem corpo", visible: true }],
    animations: [
      set("her.spot", 0, 0), set("trap.third", 0, 0), set("judges.freeze", 0, 0),
      lin("bg.dim", 0, 30, 0.6, 0.85),
      pop("verdict.stamp", W("s15", 3)),
      popOut("verdict.stamp", W("s15", 12) - 2, 8),
      lin("fire.level", W("s15", 18), W("s15", 18) + 50, 0, 1, "inOut"),
      lin("her.ascend", W("s15", 18), W("s15", 23), 0, 1, "inOut"),
      ...fx.desaturate(W("s15", 18), end(14), 0.6),
      ...mascot.place(M("pyre", -6, 7), 0.6, MS, 0),
      ...mascot.look(W("s15", 19), 0.4),
    ],
    badges: [
      { text: "CONDENADA", subtitle: "30 de maio de 1431 · Ruão", variant: "negative", appearAt: W("s15", 12) },
      { text: "TINHA 19 ANOS", variant: "info", appearAt: W("s15", 23) },
    ],
    highlights: ["CONDENADA", "HOMEM", "1431", "QUEIMADA", "RUÃO", "DEZENOVE"],
    captions: [cap("s15", 14, "Mesmo assim, foi condenada, também por voltar a usar roupas de homem. Em 30 de maio de 1431, foi queimada viva em Ruão. Tinha dezenove anos.")],
    audioCues: [narration("s15"), sfx("clunk", W("s15", 3), 0.4), sfx("fire", W("s15", 18), 0.3)],
  },
  {
    id: "s16", ...sc(15), voKey: "s16",
    narration: "Vinte e cinco anos depois, um novo julgamento a declarou inocente. Em 1920, a Igreja que a condenou a declarou santa.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.dawnMap), key(W("s16", 11) - 1, orbit([0.2, 0.12, -1.6], 16, 4, 50)), key(W("s16", 11), P.statue), key(end(15), orbit(T("paris", 0, 0, 4), 0.85, 18, 8), "linear")] },
    objects: [...base, { id: "stamp", type: "carimbo CONDENADA → INOCENTE (2D)", visible: true }, { id: "statue", type: "estátua dourada", visible: true }],
    animations: [
      set("fire.level", 0, 0), set("her.ascend", 0, 0),
      ...fx.whipIn(1, 8),
      lin("bg.dim", 0, 36, 0.85, 0),
      pop("stamp.show", W("s16", 5)),
      lin("stamp.flip", W("s16", 9), W("s16", 9) + 14, 0, 1),
      popOut("stamp.show", W("s16", 11) - 2, 6),
      lin("statue.show", W("s16", 11) - 1, W("s16", 11), 0, 1, "linear"),
      lin("statue.glow", W("s16", 19), W("s16", 19) + 24, 0, 1),
      ...fx.flash(W("s16", 20), 10),
      ...mascot.place(M("paris", -4.5, 4.5), 0.6, MS, 0),
      ...mascot.jump(W("s16", 20)),
    ],
    badges: [
      { text: "INOCENTE", subtitle: "novo julgamento, 1456", variant: "positive", appearAt: W("s16", 9), disappearAt: W("s16", 17) },
      { text: "SANTA", subtitle: "1920", variant: "positive", appearAt: W("s16", 19) },
    ],
    highlights: ["VINTE", "CINCO", "INOCENTE", "1920", "SANTA"],
    captions: [cap("s16", 15, "Vinte e cinco anos depois, um novo julgamento a declarou inocente. Em 1920, a Igreja que a condenou a declarou santa.")],
    audioCues: [narration("s16"), sfx("whoosh", 0, 0.35), sfx("pop", W("s16", 9), 0.45), sfx("shimmer", W("s16", 19), 0.45)],
  },
  {
    id: "s17", ...sc(16), voKey: "s17",
    narration: "E ela nunca usou o nome que você conhece: se apresentava como Jeanne, a Donzela. Mas o mundo a conhece como Joana d'Arc.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.statueHer), key(end(16), P.statueHer2, "inOut")] },
    objects: [...base, O.her, { id: "plates", type: "placas do nome (2D)", visible: true }],
    animations: [
      set("statue.show", 0, 1), set("statue.glow", 0, 1), set("stamp.flip", 0, 0),
      pop("plate1.show", W("s17", 12)),
      popOut("plate1.show", W("s17", 21) - 2, 6),
      lin("her.reveal", W("s17", 19), W("s17", 21) + 4, 0, 1, "out"),
      ...fx.flash(W("s17", 21), 14),
      ...fx.burst("name", W("s17", 21)),
      pop("plate2.show", W("s17", 21)),
      ...mascot.place(M("paris", -2.4, 3.6), 0.6, MS, 0),
      ...mascot.cheer(W("s17", 21), 50),
    ],
    badges: [],
    highlights: ["NUNCA", "NOME", "JEANNE", "DONZELA", "JOANA", "D'ARC"],
    captions: [cap("s17", 16, "E ela nunca usou o nome que você conhece: se apresentava como Jeanne, a Donzela. Mas o mundo a conhece como Joana d'Arc.")],
    audioCues: [narration("s17"), sfx("shimmer", W("s17", 19), 0.45), sfx("final", W("s17", 21), 0.35)],
  },
  {
    id: "s18", ...sc(17), voKey: "s18",
    narration: "Pronto: agora você sabe quem foi a camponesa que coroou um rei.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit(T("paris", 0, 4.2, 1.5), 0.6, 4, 4)), key(s(2.2), P.final, "inOut"), key(end(17), P.final2, "linear")] },
    objects: [...base, { id: "route", type: "rota completa acesa", visible: true }],
    animations: [
      set("her.reveal", 0, 1), set("plate2.show", 0, 1),
      popOut("plate2.show", s(1.2), 8),
      set("route.draw", 0, 5), set("captive.draw", 0, 1),
      lin("route.glow", s(1.0), s(2.4), 0, 1),
      pop("series.card", W("s18", 6)),
      popOut("series.card", end(17) - s(5.4), 10),
      ...mascot.place(M("paris", -2.4, 3.6), 0.6, MS, 0),
      ...mascot.wave(W("s18", 2), 50),
    ],
    badges: [{ text: "A CAMPONESA QUE COROOU UM REI", variant: "positive", appearAt: W("s18", 6), disappearAt: end(17) - s(5.4) }],
    highlights: ["PRONTO", "CAMPONESA", "COROOU", "REI"],
    captions: [cap("s18", 17, "Pronto: agora você sabe quem foi a camponesa que coroou um rei.")],
    audioCues: [narration("s18"), sfx("glow", s(1.0), 0.3)],
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
export { ST };

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
