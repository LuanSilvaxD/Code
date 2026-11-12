// scene-plan.ts — "Quem foi ela? | Gigantes da Humanidade #2" (Joana d'Arc, nome em mistério até a s17)
// Roteiro v1 (2:55) — AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa até o TTS);
// c(i, f) prende a âncora ao fim da cena. Linha do tempo determinística (sem timers / Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 175;   // 5250 frames (2:55 — teto; o conteúdo pede, ver roteiro §1)
//   export const VO_KEYS = ["s1", ..., "s18"] as const;
//   const PLANNED_SECONDS = [13.3, 9.3, 7.5, 8.7, 7.9, 8.6, 10.7, 8.9, 11.2, 7.4, 9.6, 6.6, 14.8, 10.8, 10.3, 8.3, 9.0, 12.1];
//   const GAPS = Array(17).fill(0.8);
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4% (cta em +0%). Tempos reais decidem os cortes na Fase 2.
// ----------------------------------------------------------------------------------------------
//
// FIO CONDUTOR: a VIAGEM dela num mapa-maquete do norte da França (1429). Uma fenda de luz roxa desenha a rota
// estação por estação: vilarejo → Vaucouleurs → Chinon → Orléans → Reims → Compiègne → Ruão → (Paris, estátua).
// MISTÉRIO DO NOME: "ela" = silhueta escura com contorno roxo e "?" até s17. Proibido antes disso: Joana, Jeanne,
// d'Arc, Donzela/Pucelle, Domrémy, rosto.
//
// RÉGUA: mapa ESQUEMÁTICO (distâncias comprimidas, selo "DISTÂNCIAS FORA DE ESCALA"); DENTRO de cada estação,
// 1 m = 0,06 u3d → pessoa 1,7 m = 0,10 u3d (worldScale(0.06)); torre 15 m = 0,9; muralha 8 m = 0,48.
// Pessoas/mascote só nas estações. Mapa: x = leste, z = sul, ~26 × 16 u3d sobre o pedestal.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

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

/** Estações no mapa (centro de cada miniatura, u3d). */
export const ST: Record<string, Vec3> = {
  village: [8, 0, -1], vaucouleurs: [8.6, 0, -2.2], chinon: [-6, 0, 6], orleans: [-1.5, 0, 3.5],
  reims: [4.5, 0, -4], compiegne: [1, 0, -5.5], rouen: [-5, 0, -5], paris: [-0.5, 0, -3],
};
const y = (v: Vec3, h: number): Vec3 => [v[0], h, v[2]];
const P = {
  orleansHero: orbit(y(ST.orleans, 0.12), 2.4, 18, 6), // ela + exército, plano baixo
  pyre: orbit(y(ST.rouen, 0.15), 2.0, 10, 10),
  mapAll: orbit([0, 0, 0.5], 26, 0, 48),
  village: orbit(y(ST.village, 0.1), 3.2, 20, 18),
  mapTerritory: orbit([0, 0, 0.5], 20, 0, 60),
  throne: orbit(y(ST.chinon, 0.12), 2.2, 24, 10),
  villageLow: orbit(y(ST.village, 0.12), 2.6, -10, 8),
  route: orbit([1, 0, 1], 18, 0, 55),
  gate: orbit(y(ST.vaucouleurs, 0.15), 2.4, 20, 12),
  ride: orbit([3, 0.1, 2], 3.0, 90, 10), // tracking lateral; alvo acompanha riders.x
  court1: orbit(y(ST.chinon, 0.12), 2.8, 30, 22),
  orleansWide: orbit(y(ST.orleans, 0.2), 7, 15, 40),
  orleansMap: orbit(y(ST.orleans, 0), 16, 0, 55),
  loire: orbit(y(ST.orleans, 0.1), 3.2, 40, 12),
  arrow: orbit(y(ST.orleans, 0.14), 1.4, 30, 6),
  banner: orbit(y(ST.orleans, 0.14), 1.8, 20, 4),
  reimsMap: orbit([1.5, 0, 0], 18, 0, 50),
  cathedral: orbit(y(ST.reims, 0.2), 3.6, 10, 8),
  bridge: orbit(y(ST.compiegne, 0.12), 2.6, 25, 14),
  courtRouen: orbit(y(ST.rouen, 0.1), 3.4, 15, 35),
  courtClose: orbit(y(ST.rouen, 0.13), 1.6, 5, 6),
  market: orbit(y(ST.rouen, 0.15), 4, 20, 20),
  dawnMap: orbit([0, 0, 0], 12, 0, 45),
  statue: orbit(y(ST.paris, 0.25), 2.4, 10, 6),
  final: orbit([0, 0, 0.5], 22, 0, 40),
};

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Ela tinha dezessete anos, não sabia ler, e convenceu um príncipe a lhe dar um exército. Dois anos depois, foi queimada viva. Quem foi ela? Este é o Gigantes da Humanidade.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.orleansHero), key(W("s1", 15) - 1, P.orleansHero), key(W("s1", 15), P.pyre, "out"), key(W("s1", 19) - 1, P.pyre), key(W("s1", 19), P.pyre), key(c(0, W("s1", 19) + 60), P.mapAll, "inOut")] },
    objects: [
      { id: "her", type: "Person(silhouette, armor, banner)", visible: true },
      { id: "army", type: "Person[6] francês", visible: true, state: { start: "oculto", end: "visível" } },
      { id: "pyre", type: "Pyre", visible: true, state: { start: "apagada", end: "chamas" } },
      { id: "map", type: "FranceMap", visible: true }, { id: "mascot", type: "Mascot", visible: true },
      { id: "seriesCard", type: "SeriesCard", visible: true, state: { start: "oculto", end: "EP. 02" } },
    ],
    animations: [
      fx.flash(0), lin("banner.wave", 0, end(0), 0, 1, "linear"), pop("army.show", W("s1", 13)),
      mascot.wave(W("s1", 4), 30), lin("fire.level", W("s1", 15), W("s1", 15) + 20, 0, 1, "out"),
      fx.desaturate(W("s1", 15), W("s1", 19), 0.6), mascot.jump(W("s1", 16)), pop("her.qmark", W("s1", 19)),
      pop("series.card", W("s1", 22)),
    ],
    badges: [
      { text: "17 ANOS · NÃO SABIA LER", variant: "warning", appearAt: W("s1", 2), disappearAt: W("s1", 15) },
      { text: "QUEIMADA VIVA", subtitle: "2 anos depois", variant: "negative", appearAt: W("s1", 17), disappearAt: W("s1", 19) },
      { text: "QUEM FOI ELA?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 19), disappearAt: W("s1", 22) },
    ],
    highlights: ["dezessete", "exército", "queimada", "Gigantes"],
    captions: [cap("s1", 0, "Ela tinha dezessete anos, não sabia ler, e convenceu um príncipe a lhe dar um exército. Dois anos depois, foi queimada viva. Quem foi ela? Este é o Gigantes da Humanidade.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("thud", W("s1", 15), 0.6), sfx("fire", W("s1", 15), 0.35), sfx("shimmer", W("s1", 22), 0.4)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Tudo começa num vilarejo da França, por volta de 1412, em plena Guerra dos Cem Anos. Os ingleses e seus aliados dominavam metade do país.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.village), key(W("s2", 12), P.village), key(c(1, W("s2", 12) + 40), P.mapTerritory, "inOut")] },
    objects: [
      { id: "village", type: "Village", visible: true }, { id: "herChild", type: "Person(silhouette, tunic)", visible: true },
      { id: "territory", type: "MapTint", visible: true, state: { start: "neutro", end: "vermelho N/L · azul S" } },
      { id: "schematicSeal", type: "Seal", visible: true }, { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [fx.whipIn("left", 10), pop("year.1412", W("s2", 8)), lin("village.smoke", 0, end(1), 0, 1, "linear"), lin("territory.english", W("s2", 17), W("s2", 17) + 50, 0, 1), lin("territory.french", W("s2", 22), W("s2", 22) + 30, 0, 1)],
    badges: [
      { text: "POR VOLTA DE 1412", variant: "info", appearAt: W("s2", 8), disappearAt: W("s2", 12) },
      { text: "GUERRA DOS CEM ANOS", subtitle: "1337–1453", variant: "info", appearAt: W("s2", 12) },
    ],
    highlights: ["1412", "Cem Anos", "ingleses", "metade"],
    captions: [cap("s2", 1, "Tudo começa num vilarejo da França, por volta de 1412, em plena Guerra dos Cem Anos. Os ingleses e seus aliados dominavam metade do país.")],
    audioCues: [narration("s2"), sfx("whoosh-soft", 0, 0.5), sfx("rumble-soft", W("s2", 17), 0.4)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "E o herdeiro do trono, Carlos, nem tinha sido coroado: um tratado prometia a coroa ao rei inglês.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.throne), key(W("s3", 10), P.throne), key(c(2, W("s3", 10) + 50), P.route, "inOut")] },
    objects: [{ id: "charles", type: "Person(cloak)", visible: true }, { id: "throne", type: "ThroneHall", visible: true }, { id: "treaty", type: "Scroll", visible: true }, { id: "crown", type: "Crown", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("charles.slump", W("s3", 6), W("s3", 6) + 20, 0, 1), pop("treaty.show", W("s3", 11)), fx.shake(W("s3", 11), 8), lin("crown.float", W("s3", 14), c(2, W("s3", 14) + 60), 0, 1, "inOut"), mascot.look(W("s3", 6), -0.6)],
    badges: [
      { text: "HERDEIRO SEM COROA", variant: "negative", appearAt: W("s3", 3) },
      { text: "TRATADO DE TROYES", subtitle: "1420", variant: "info", appearAt: W("s3", 11) },
    ],
    highlights: ["herdeiro", "Carlos", "tratado", "rei inglês"],
    captions: [cap("s3", 2, "E o herdeiro do trono, Carlos, nem tinha sido coroado: um tratado prometia a coroa ao rei inglês.")],
    audioCues: [narration("s3"), sfx("clunk", W("s3", 11), 0.5)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Aos treze anos, ela disse ouvir uma voz de Deus. A missão: expulsar os ingleses e levar Carlos para ser coroado.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.villageLow), key(W("s4", 10), P.villageLow), key(c(3, W("s4", 10) + 45), P.route, "inOut")] },
    objects: [{ id: "herChild", type: "Person(silhouette, tunic)", visible: true }, { id: "beam", type: "LightBeam", visible: true, state: { start: "apagado", end: "aceso" } }, { id: "route", type: "RouteLine", visible: true, state: { start: "0", end: "até Reims" } }],
    animations: [lin("voice.beam", W("s4", 5), W("s4", 5) + 25, 0, 1, "out"), lin("route.draw", W("s4", 10), c(3, W("s4", 10) + 90), 0, 0.55), pop("icon.orleans", W("s4", 12)), pop("icon.reims", W("s4", 18))],
    badges: [
      { text: "AOS 13 ANOS: \"UMA VOZ DE DEUS\"", subtitle: "relato dela no julgamento", variant: "info", appearAt: W("s4", 2) },
      { text: "MISSÃO: EXPULSAR · COROAR", variant: "positive", appearAt: W("s4", 10) },
    ],
    highlights: ["treze", "voz", "missão", "coroado"],
    captions: [cap("s4", 3, "Aos treze anos, ela disse ouvir uma voz de Deus. A missão: expulsar os ingleses e levar Carlos para ser coroado.")],
    audioCues: [narration("s4"), sfx("shimmer", W("s4", 5), 0.4)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Só que ela era uma camponesa. Pediu uma escolta ao capitão da cidade vizinha, e ele a mandou de volta para casa.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.gate), key(end(4), orbit(y(ST.vaucouleurs, 0.15), 2.2, 32, 12))] },
    objects: [{ id: "gate", type: "CastleGate", visible: true, state: { start: "aberto", end: "fechado" } }, { id: "captain", type: "Person(armor-simple)", visible: true }, { id: "herChild", type: "Person(silhouette, tunic)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("her.walk", 0, W("s5", 6), 0, 1), lin("captain.point", W("s5", 16), W("s5", 16) + 12, 0, 1), lin("gate.close", W("s5", 18), W("s5", 18) + 20, 0, 1, "in"), fx.punch(W("s5", 19)), mascot.jump(W("s5", 17))],
    badges: [
      { text: "CAMPONESA, SEM ESCOLTA", variant: "negative", appearAt: W("s5", 4) },
      { text: "\"VOLTE PARA CASA\"", variant: "negative", appearAt: W("s5", 16) },
    ],
    highlights: ["camponesa", "escolta", "volta"],
    captions: [cap("s5", 4, "Só que ela era uma camponesa. Pediu uma escolta ao capitão da cidade vizinha, e ele a mandou de volta para casa.")],
    audioCues: [narration("s5"), sfx("clunk", W("s5", 18) + 18, 0.6)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Ela voltou e insistiu até ele ceder. Vestida de homem, cruzou terras inimigas com seis soldados até o castelo do herdeiro.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.gate), key(W("s6", 7) - 1, P.gate), key(W("s6", 7), P.ride), key(end(5), orbit([-4, 0.1, 5], 3.0, 90, 10), "linear")] },
    objects: [{ id: "gate", type: "CastleGate", visible: true, state: { start: "fechado", end: "aberto" } }, { id: "riders", type: "Horse[7]+Person[7]", visible: true }, { id: "sky", type: "Backdrop", visible: true, state: { start: "dia", end: "noite" } }, { id: "route", type: "RouteLine", visible: true }],
    animations: [lin("gate.close", W("s6", 5), W("s6", 5) + 20, 1, 0), lin("her.outfit", W("s6", 7), W("s6", 7) + 10, 0, 1), lin("riders.x", W("s6", 7), end(5), 0, 1, "linear"), lin("sky.night", W("s6", 7), W("s6", 7) + 30, 0, 1)],
    badges: [
      { text: "INSISTIU · ESCOLTA DE 6", variant: "positive", appearAt: W("s6", 3) },
      { text: "TERRAS INIMIGAS", variant: "warning", appearAt: W("s6", 11) },
    ],
    highlights: ["insistiu", "homem", "inimigas", "seis"],
    captions: [cap("s6", 5, "Ela voltou e insistiu até ele ceder. Vestida de homem, cruzou terras inimigas com seis soldados até o castelo do herdeiro.")],
    audioCues: [narration("s6"), sfx("gallop", W("s6", 7), 0.4)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Carlos desconfiou e mandou teólogos interrogarem ela por semanas. Não acharam nada de errado. Ela ganhou armadura, estandarte e um lugar no exército.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.court1), key(W("s7", 15), orbit(y(ST.chinon, 0.12), 2.4, 30, 14)), key(end(6), orbit(y(ST.chinon, 0.12), 2.4, 140, 14), "inOut")] },
    objects: [{ id: "theologians", type: "Person[4](cassock)", visible: true }, { id: "charles", type: "Person(cloak)", visible: true }, { id: "her", type: "Person(silhouette)", visible: true, state: { start: "roupa masculina", end: "armadura + estandarte" } }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [pop("theologians.ring", W("s7", 4)), pop("qmarks.show", W("s7", 6)), lin("qmarks.solve", W("s7", 9), W("s7", 9) + 12, 0, 1), lin("armor.assemble", W("s7", 16), W("s7", 16) + 60, 0, 1, "out"), lin("banner.raise", W("s7", 17), W("s7", 17) + 25, 0, 1), fx.flash(W("s7", 17)), mascot.cheer(W("s7", 18), 40)],
    badges: [
      { text: "INTERROGADA POR SEMANAS", variant: "warning", icon: "?", appearAt: W("s7", 4), disappearAt: W("s7", 15) },
      { text: "ARMADURA · ESTANDARTE · EXÉRCITO", variant: "positive", appearAt: W("s7", 15) },
    ],
    highlights: ["teólogos", "semanas", "armadura", "exército"],
    captions: [cap("s7", 6, "Carlos desconfiou e mandou teólogos interrogarem ela por semanas. Não acharam nada de errado. Ela ganhou armadura, estandarte e um lugar no exército.")],
    audioCues: [narration("s7"), sfx("clunk", W("s7", 16), 0.4), sfx("shimmer", W("s7", 17), 0.5)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "O alvo era Orléans, cercada pelos ingleses havia meses. Se a cidade caísse, o caminho para o resto da França ficava aberto.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.orleansWide), key(W("s8", 10), P.orleansWide), key(c(7, W("s8", 10) + 45), P.orleansMap, "inOut")] },
    objects: [{ id: "orleans", type: "OrleansCity", visible: true }, { id: "bastilles", type: "Bastille[3]", visible: true }, { id: "english", type: "Person[8] inglês", visible: true }, { id: "arrowsSouth", type: "MapArrows", visible: true }],
    animations: [fx.whipIn("right", 10), lin("siege.ring", W("s8", 3), W("s8", 3) + 30, 0, 1), lin("arrows.south", W("s8", 12), W("s8", 12) + 40, 0, 1)],
    badges: [
      { text: "ORLÉANS CERCADA", subtitle: "desde outubro de 1428", variant: "negative", appearAt: W("s8", 3) },
      { text: "SE CAIR, O SUL FICA ABERTO", variant: "warning", appearAt: W("s8", 12) },
    ],
    highlights: ["Orléans", "cercada", "caísse", "aberto"],
    captions: [cap("s8", 7, "O alvo era Orléans, cercada pelos ingleses havia meses. Se a cidade caísse, o caminho para o resto da França ficava aberto.")],
    audioCues: [narration("s8"), sfx("whoosh-soft", 0, 0.5), sfx("rumble-soft", W("s8", 3), 0.4)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Ela chegou no fim de abril de 1429. Os franceses tomaram os fortes ingleses um a um. Ela levou uma flechada e voltou para a luta. Em nove dias, o cerco acabou.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.loire), key(W("s9", 18) - 1, orbit(y(ST.orleans, 0.1), 3.0, 70, 12)), key(W("s9", 18), P.arrow), key(W("s9", 26) - 1, P.arrow), key(W("s9", 26), P.orleansWide), key(end(8), orbit(y(ST.orleans, 0.2), 7.5, 25, 38))] },
    objects: [{ id: "convoy", type: "Person[8]+Horse[2]", visible: true }, { id: "bastilles", type: "Bastille[3]", visible: true, state: { start: "inglesas", end: "francesas" } }, { id: "arrow", type: "Arrow", visible: true }, { id: "dayCounter", type: "Counter2D", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("convoy.enter", 0, W("s9", 8), 0, 1), lin("forts.fall", W("s9", 9), W("s9", 17), 0, 3, "linear", "count"), lin("arrow.hit", W("s9", 19), W("s9", 19) + 6, 0, 1, "in"), fx.shake(W("s9", 20), 10), lin("her.rise", W("s9", 22), W("s9", 22) + 20, 0, 1), lin("day", W("s9", 26), W("s9", 30), 1, 9, "linear", "count"), fx.flash(W("s9", 31)), mascot.cheer(W("s9", 31), 40)],
    badges: [
      { text: "FIM DE ABRIL DE 1429", variant: "info", appearAt: W("s9", 1), disappearAt: W("s9", 18) },
      { text: "FERIDA POR FLECHA", variant: "warning", appearAt: W("s9", 19), disappearAt: W("s9", 26) },
      { text: "CERCO ACABOU EM 9 DIAS", subtitle: "8 de maio de 1429", variant: "positive", appearAt: W("s9", 26) },
    ],
    highlights: ["abril", "fortes", "flechada", "nove dias"],
    captions: [cap("s9", 8, "Ela chegou no fim de abril de 1429. Os franceses tomaram os fortes ingleses um a um. Ela levou uma flechada e voltou para a luta. Em nove dias, o cerco acabou.")],
    audioCues: [narration("s9"), sfx("thud", W("s9", 19), 0.6), sfx("tick", W("s9", 26), 0.4), sfx("pop", W("s9", 31), 0.5)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "E ela nem lutava de espada: no julgamento, disse que carregava o estandarte para não matar ninguém.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.banner), key(end(9), orbit(y(ST.orleans, 0.14), 1.5, 30, 4))] },
    objects: [{ id: "her", type: "Person(silhouette, armor, banner)", visible: true }, { id: "compare", type: "CompareCards2D", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("banner.wave", 0, end(9), 0.5, 1), pop("compare.sword", W("s10", 5)), pop("compare.banner", W("s10", 12)), mascot.point(W("s10", 12), 40)],
    badges: [{ text: "ESTANDARTE, NÃO ESPADA", subtitle: "relato dela no processo de 1431", variant: "info", appearAt: W("s10", 7) }],
    highlights: ["espada", "estandarte", "ninguém"],
    captions: [cap("s10", 9, "E ela nem lutava de espada: no julgamento, disse que carregava o estandarte para não matar ninguém.")],
    audioCues: [narration("s10"), sfx("whoosh-soft", W("s10", 12), 0.3)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Depois, abriu caminho até Reims, a cidade onde os reis franceses eram coroados. Em julho de 1429, Carlos virou rei, com ela ao lado.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.reimsMap), key(W("s11", 13) - 1, P.reimsMap), key(W("s11", 13), P.cathedral), key(end(10), orbit(y(ST.reims, 0.2), 3.0, 18, 6))] },
    objects: [{ id: "route", type: "RouteLine", visible: true }, { id: "cathedral", type: "Cathedral", visible: true }, { id: "charles", type: "Person(cloak)", visible: true, state: { start: "sem coroa", end: "coroado" } }, { id: "crowd", type: "Person[12]", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("route.draw", 0, W("s11", 5), 0.55, 0.7), lin("crown.lower", W("s11", 19), W("s11", 19) + 40, 0, 1, "out"), fx.flash(W("s11", 20)), lin("territory.french", W("s11", 20), W("s11", 20) + 30, 1, 1.15), mascot.wave(W("s11", 21), 30)],
    badges: [
      { text: "REIMS: CIDADE DAS COROAÇÕES", variant: "info", appearAt: W("s11", 4), disappearAt: W("s11", 13) },
      { text: "CARLOS COROADO", subtitle: "17 de julho de 1429", variant: "positive", appearAt: W("s11", 19) },
    ],
    highlights: ["Reims", "coroados", "rei"],
    captions: [cap("s11", 10, "Depois, abriu caminho até Reims, a cidade onde os reis franceses eram coroados. Em julho de 1429, Carlos virou rei, com ela ao lado.")],
    audioCues: [narration("s11"), sfx("bells", W("s11", 19), 0.45), sfx("shimmer", W("s11", 20), 0.4)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "Mas a sorte virou. Em maio de 1430, ela foi capturada numa batalha e vendida aos ingleses.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.bridge), key(W("s12", 12), P.bridge), key(c(11, W("s12", 12) + 40), P.route, "inOut")] },
    objects: [{ id: "drawbridge", type: "Drawbridge", visible: true, state: { start: "baixa", end: "erguida" } }, { id: "captors", type: "Person[5] borgonhês", visible: true }, { id: "coins", type: "Coins", visible: true }],
    animations: [fx.whipIn("left", 8), lin("drawbridge.raise", W("s12", 2), W("s12", 2) + 25, 0, 1), lin("captors.close", W("s12", 8), W("s12", 8) + 20, 0, 1), lin("coins.flow", W("s12", 13), W("s12", 13) + 30, 0, 1), fx.desaturate(W("s12", 8), end(11), 0.4)],
    badges: [
      { text: "CAPTURADA", subtitle: "23 de maio de 1430", variant: "negative", appearAt: W("s12", 8) },
      { text: "VENDIDA AOS INGLESES", variant: "negative", appearAt: W("s12", 13) },
    ],
    highlights: ["sorte", "capturada", "vendida"],
    captions: [cap("s12", 11, "Mas a sorte virou. Em maio de 1430, ela foi capturada numa batalha e vendida aos ingleses.")],
    audioCues: [narration("s12"), sfx("chains", W("s12", 8), 0.4), sfx("crumble", W("s12", 2), 0.35)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "Num tribunal da Igreja, dezenas de homens estudados tentaram provar que as vozes eram mentira. Perguntaram se ela estava na graça de Deus. Se dissesse sim, era arrogância. Se dissesse não, confessava culpa.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.courtRouen), key(end(12), orbit(y(ST.rouen, 0.1), 2.4, 10, 28), "inOut")] },
    objects: [{ id: "court", type: "CourtRoom", visible: true }, { id: "judges", type: "Person[22](cassock)+Bishop", visible: true }, { id: "her", type: "Person(silhouette)", visible: true }, { id: "trap", type: "TrapDoors2D", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("court.fill", 0, W("s13", 6), 0, 1), lin("bg.dim", 0, 30, 0, 0.6), pop("question.show", W("s13", 15)), pop("trap.yes", W("s13", 23)), fx.punch(W("s13", 25)), pop("trap.no", W("s13", 28)), fx.punch(W("s13", 31))],
    badges: [
      { text: "JULGADA POR HERESIA", variant: "negative", appearAt: W("s13", 2), disappearAt: W("s13", 13) },
      { text: "\"ESTÁ NA GRAÇA DE DEUS?\"", variant: "warning", icon: "?", appearAt: W("s13", 13) },
    ],
    highlights: ["tribunal", "mentira", "graça", "arrogância", "culpa"],
    captions: [cap("s13", 12, "Num tribunal da Igreja, dezenas de homens estudados tentaram provar que as vozes eram mentira. Perguntaram se ela estava na graça de Deus. Se dissesse sim, era arrogância. Se dissesse não, confessava culpa.")],
    audioCues: [narration("s13"), sfx("murmur", 0, 0.25), sfx("buzz", W("s13", 25), 0.4), sfx("buzz", W("s13", 31), 0.4)],
  },
  {
    id: "s14", ...sc(13), voKey: "s14",
    narration: "Ela respondeu: se não estou, que Deus me coloque nela. Se estou, que Deus me mantenha. Sem saber ler, deixou os juízes sem saída.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.courtClose), key(W("s14", 17) - 1, orbit(y(ST.rouen, 0.13), 1.4, 0, 6)), key(W("s14", 17), P.courtRouen), key(end(13), orbit(y(ST.rouen, 0.1), 3.0, 20, 30))] },
    objects: [{ id: "quote", type: "QuoteCard2D", visible: true }, { id: "trap", type: "TrapDoors2D", visible: true, state: { start: "2 × ✖", end: "3ª saída ✔" } }, { id: "judges", type: "Person[22]", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [pop("quote.l1", W("s14", 1)), pop("quote.l2", W("s14", 9)), lin("trap.third", W("s14", 15), W("s14", 15) + 20, 0, 1), lin("judges.freeze", W("s14", 17), W("s14", 17) + 10, 0, 1), fx.flash(W("s14", 15)), mascot.cheer(W("s14", 19), 30)],
    badges: [
      { text: "\"SE NÃO ESTOU, QUE DEUS ME COLOQUE…\"", subtitle: "registro do processo, 1431", variant: "positive", appearAt: W("s14", 1) },
      { text: "SEM SABER LER", variant: "info", appearAt: W("s14", 17) },
    ],
    highlights: ["coloque", "mantenha", "sem saída"],
    captions: [cap("s14", 13, "Ela respondeu: se não estou, que Deus me coloque nela. Se estou, que Deus me mantenha. Sem saber ler, deixou os juízes sem saída.")],
    audioCues: [narration("s14"), sfx("shimmer", W("s14", 15), 0.45)],
  },
  {
    id: "s15", ...sc(14), voKey: "s15",
    narration: "Mesmo assim, foi condenada, também por voltar a usar roupas de homem. Em 30 de maio de 1431, foi queimada viva em Ruão. Tinha dezenove anos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit(y(ST.rouen, 0.15), 3.0, 20, 16)), key(end(14), P.market, "inOut")] },
    objects: [{ id: "market", type: "MarketSquare", visible: true }, { id: "pyre", type: "Pyre", visible: true, state: { start: "apagada", end: "chamas" } }, { id: "her", type: "Person(silhouette)", visible: true, state: { start: "presente", end: "luz que sobe" } }, { id: "crowd", type: "Person[14] de costas", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [lin("bg.dim", 0, 30, 0.6, 0.8), pop("verdict.stamp", W("s15", 3)), lin("fire.level", W("s15", 14), W("s15", 14) + 60, 0, 1), lin("her.ascend", W("s15", 16), W("s15", 16) + 50, 0, 1), fx.desaturate(W("s15", 14), end(14), 0.7), mascot.look(W("s15", 16), 0.5)],
    badges: [
      { text: "CONDENADA", subtitle: "30 de maio de 1431", variant: "negative", appearAt: W("s15", 3) },
      { text: "19 ANOS", variant: "info", appearAt: W("s15", 23) },
    ],
    highlights: ["condenada", "roupas de homem", "Ruão", "dezenove"],
    captions: [cap("s15", 14, "Mesmo assim, foi condenada, também por voltar a usar roupas de homem. Em 30 de maio de 1431, foi queimada viva em Ruão. Tinha dezenove anos.")],
    audioCues: [narration("s15"), sfx("clunk", W("s15", 3), 0.5), sfx("fire", W("s15", 14), 0.35)],
  },
  {
    id: "s16", ...sc(15), voKey: "s16",
    narration: "Vinte e cinco anos depois, um novo julgamento a declarou inocente. Em 1920, a Igreja que a condenou a declarou santa.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.dawnMap), key(W("s16", 13) - 1, orbit([0, 0, -1.5], 9, 0, 40)), key(W("s16", 13), orbit(y(ST.paris, 0.25), 3.4, 10, 10)), key(end(15), orbit(y(ST.paris, 0.25), 2.8, 14, 8))] },
    objects: [{ id: "stamp", type: "Stamp2D", visible: true, state: { start: "CONDENADA", end: "INOCENTE" } }, { id: "statue", type: "GoldenEquestrianStatue", visible: true, state: { start: "apagada", end: "brilhando" } }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [fx.whipIn("up", 10), lin("bg.dim", 0, 40, 0.8, 0), lin("stamp.flip", W("s16", 9), W("s16", 9) + 15, 0, 1), pop("year.1920", W("s16", 12)), lin("statue.glow", W("s16", 19), W("s16", 19) + 30, 0, 1), mascot.jump(W("s16", 20))],
    badges: [
      { text: "INOCENTE", subtitle: "1456", variant: "positive", appearAt: W("s16", 9) },
      { text: "SANTA", subtitle: "1920", variant: "positive", appearAt: W("s16", 19) },
    ],
    highlights: ["inocente", "1920", "santa"],
    captions: [cap("s16", 15, "Vinte e cinco anos depois, um novo julgamento a declarou inocente. Em 1920, a Igreja que a condenou a declarou santa.")],
    audioCues: [narration("s16"), sfx("whoosh-soft", 0, 0.5), sfx("pop", W("s16", 9), 0.5), sfx("shimmer", W("s16", 19), 0.45)],
  },
  {
    id: "s17", ...sc(16), voKey: "s17",
    narration: "E ela nunca usou o nome que você conhece: se apresentava como Jeanne, a Donzela. Mas o mundo a conhece como Joana d'Arc.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.statue), key(end(16), orbit(y(ST.paris, 0.25), 2.0, 4, 4), "inOut")] },
    objects: [{ id: "her", type: "Person(silhouette→revealed, armor, banner)", visible: true }, { id: "plate1", type: "NamePlate2D", visible: true }, { id: "plate2", type: "NamePlate2D(large)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [pop("plate1.show", W("s17", 11)), lin("her.reveal", W("s17", 16), W("s17", 16) + 20, 0, 1, "out"), fx.flash(W("s17", 20)), pop("plate2.show", W("s17", 20)), mascot.cheer(W("s17", 21), 50)],
    badges: [
      { text: "JEHANNE, \"A DONZELA\"", subtitle: "como ela assinava e se apresentava", variant: "warning", appearAt: W("s17", 11), disappearAt: W("s17", 20) },
      { text: "JOANA D'ARC", variant: "positive", size: "large", appearAt: W("s17", 20) },
    ],
    highlights: ["nunca", "Jeanne", "Joana d'Arc"],
    captions: [cap("s17", 16, "E ela nunca usou o nome que você conhece: se apresentava como Jeanne, a Donzela. Mas o mundo a conhece como Joana d'Arc.")],
    audioCues: [narration("s17"), sfx("shimmer", W("s17", 16), 0.5), sfx("pop", W("s17", 20), 0.6)],
  },
  {
    id: "s18", ...sc(17), voKey: "s18",
    narration: "Pronto: agora você sabe quem foi a camponesa que coroou um rei.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit(y(ST.paris, 0.25), 3.0, 8, 10)), key(70, P.final, "inOut"), key(end(17), orbit([0, 0, 0.5], 21, 8, 40), "linear")] },
    objects: [{ id: "map", type: "FranceMap", visible: true }, { id: "route", type: "RouteLine", visible: true, state: { start: "acesa", end: "brilhando" } }, { id: "mascot", type: "Mascot", visible: true }, { id: "seriesCard", type: "SeriesCard", visible: true }],
    animations: [lin("route.glow", 0, 60, 0, 1), mascot.wave(W("s18", 2), 40), pop("series.card", W("s18", 1))],
    badges: [{ text: "A CAMPONESA QUE COROOU UM REI", variant: "positive", appearAt: W("s18", 6) }],
    highlights: ["camponesa", "rei"],
    captions: [cap("s18", 17, "Pronto: agora você sabe quem foi a camponesa que coroou um rei.")],
    audioCues: [narration("s18"), sfx("fenda-close", c(17, end(17) - 160), 0.6)],
  },
];

// Integridade: contíguo de 0 a DURATION (verificado ao importar na Fase 2).
void evaluateTrack;
