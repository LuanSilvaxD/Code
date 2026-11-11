// scene-plan.ts — "Como construíram Stonehenge?" (formato PROBLEMA → SOLUÇÃO + fecho de PERGUNTA → REVELAÇÃO)
// Roteiro v1 (2:55) — APROVADO; cortes derivados da voz real (utils/timing.ts)
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa até o TTS;
// c(i, f) prende a âncora ao fim da cena). Linha do tempo determinística (sem timers / Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 175;   // 5250 frames (2:55 — teto do formato; o conteúdo pede, ver roteiro §1)
//   export const VO_KEYS = ["s1", ..., "s15"] as const;
//   const PLANNED_SECONDS = [12.3, 10.1, 12.2, 9.9, 8.3, 10.6, 9.0, 11.9, 10.2, 12.4, 9.9, 6.6, 11.0, 7.3, 13.1];
//   const GAPS = [0.9, 1.0, 0.9, 0.8, 1.1, 0.9, 1.0, 1.0, 1.0, 1.0, 0.9, 1.2, 1.1, 1.0];
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4% (cta em +0%). Tempos reais decidem os cortes na Fase 2.
// ----------------------------------------------------------------------------------------------
//
// FIO CONDUTOR: a OBRA acontece na frente do espectador. Um único diorama da planície de Salisbury sobre o
// pedestal da marca; o monumento vai sendo construído fase por fase (vala → pedras chegam → erguidas → lintéis →
// completo → alinhado com o Sol → ruína de hoje). Cada "problema" usa um CANTEIRO na frente do círculo, onde UMA
// pedra passa por todas as etapas (trenó → martelos → buraco → plataforma → encaixe) e vira a pedra que falta no anel.
//
// RÉGUA: 1 m = 0,1 u3d (todo o diorama na mesma régua, sem selo de esquema exceto na vala, ver abaixo).
//   Anel externo de sarsens: Ø 30 m → raio 1,5 u3d; pedras em pé ~4,1 m acima do chão → 0,41 u3d; lintéis a ~4 m.
//   Trilitos internos (ferradura): 5, subindo até ~7,3 m (Grande Trilito; pedra 56 ~6,7 m acima do chão hoje).
//   Pessoas: worldScale(0.1) → 1,7 m = 0,17 u3d. Mascote ~1,6 m. Vala circular: Ø ~110 m → raio 5,5 u3d.
//   Pedra do Calcanhar: fora da vala, na entrada nordeste, sobre o EIXO DO SOLSTÍCIO (eixo = +x no diorama).
// Mapa da Grã-Bretanha (s3–s5) é uma camada 2D sobre a cena escurecida (contorno real Natural Earth, via world-atlas).

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { heightAt } from "../components/Terrain";
import { worldScale } from "../components/Person";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

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
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });

const MS = worldScale(0.1).mascot;
/** ponto no chão (u3d) a partir de x,z em u3d */
const g = (x: number, z: number): Vec3 => [x, heightAt(x * 10, z * 10) * 0.1, z];
/** Canteiro de obra: na frente do anel, do lado da câmera (+z). A pedra-modelo termina no vão do anel em [0, 0, 1.5]. */
export const SITE: Vec3 = [0, 0, 1.5];
export const HEEL: Vec3 = [7.2, 0, 0]; // Pedra do Calcanhar no eixo (+x = nordeste)
const P = {
  hero: orbit([0, 0.32, 0], 9, 28, 8), // monumento completo, baixo e heroico
  hero2: orbit([0, 0.3, 0], 10.5, 52, 12),
  heroWide: orbit([0, 0.2, 0], 17, 20, 24),
  ditch: orbit([0, 0, 0], 52, -14, 52), // vala inteira
  cremation: orbit([4.05, 0, 2.5], 7, 10, 34), // borda interna da vala, covinhas brancas
  cremation2: orbit([4.05, 0, 2.5], 8, 30, 28),
  mapHold: orbit([0, 0, 0], 40, 14, 40), // cena escurecida atrás do mapa 2D
  mapHold2: orbit([0, 0, 0], 42, 4, 40),
  mapHold3: orbit([0, 0, 0], 43, -6, 40),
  sledgeFar: orbit([0, 0.15, 5.95], 5, 40, 12), // trenó chegando
  sledgeSide: orbit([0, 0.15, 2.85], 4.2, 70, 8),
  sledgeOut: orbit([0, 0.15, 2.05], 5.5, 60, 14),
  hammer: orbit([0, 0.15, 2.6], 1.9, 40, 16), // close dos martelos
  hammer2: orbit([0, 0.15, 2.6], 2.3, 10, 22),
  pitFront: orbit([0, 0.2, 2.2], 4.5, 60, 14),
  pit: orbit([0, 0.2, 1.75], 4.2, 74, 18), // vista lateral do corte com a rampa
  pitEnd: orbit([0, 0.25, 1.5], 4.6, 64, 10),
  platform: orbit([-0.15, 0.25, 1.65], 4.5, 40, 12),
  platformTop: orbit([-0.15, 0.42, 1.6], 4, 30, 18),
  joint: orbit([-0.157, 0.44, 1.49], 1.6, 22, 22), // vista explodida do encaixe
  joint2: orbit([-0.157, 0.44, 1.49], 2.0, -18, 20),
  ring: orbit([0, 0.3, 0], 18, 12, 50), // anel visto de cima
  ringLow: orbit([0, 0.3, 0], 17, 40, 10),
  axisDawn: orbit([7.8, 0.19, 0], 7.8, -90, 0), // do centro, olhando para +x (Calcanhar e nascente)
  axisDusk: orbit([-0.5, 0.3, 0], 8.6, 92, 1.5), // do Calcanhar olhando para o centro e o poente (−x)
  axisDusk2: orbit([-0.9, 0.32, 0], 7.4, 93, 1.5),
  dusk: orbit([-1.4, 0.36, 0], 5.2, 92, 2),
  ruin: orbit([0, 0.3, 0], 14, 34, 16),
  ruin2: orbit([0, 0.3, 0], 16, 60, 20),
  final: orbit([0, 0.2, 0], 24, 46, 24),
  final2: orbit([0, 0.2, 0], 30, 70, 26),
};

const O = {
  backdrop: { id: "backdrop", type: "estúdio Fenda Umbra (tint história #2e1f3a); céu do diorama muda com sun.phase", visible: true },
  plain: { id: "plain", type: "planície de Salisbury low-poly no pedestal: grama, leves ondulações, montes funerários ao fundo", visible: true },
  ditch: { id: "ditch", type: "vala circular + barranco interno e externo (Ø ~110 m), entrada a nordeste", visible: true },
  monument: { id: "monument", type: "Stonehenge montável: 30 sarsens + 30 lintéis curvos, 5 trilitos, pedras azuis, Pedra do Altar (trilhas *.built)", visible: true },
  heel: { id: "heel", type: "Pedra do Calcanhar (bruta, inclinada) no eixo +x", visible: true },
  crew: { id: "crew", type: "trabalhadores neolíticos (Person variante túnica, crowdLooks(n, 'neolitico'))", visible: true },
  mascot: { id: "mascot", type: "mascote andando pelo diorama como visitante (mascot.walk)", visible: true },
};
const base = [O.backdrop, O.plain, O.ditch, O.monument, O.heel, O.mascot];

export const scenes: ScenePlan[] = [
  // 1 — GANCHO: o monumento completo, a pergunta
  {
    id: "scene-01-gancho",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration: "Pedras de vinte e cinco toneladas, de pé, em círculo, com outras deitadas por cima. E tudo isso há quatro mil e quinhentos anos, só com pedra, madeira e corda. Como construíram Stonehenge?",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.hero), key(W("s1", 15), P.hero2, "soft"), key(end(0), P.heroWide, "soft")] },
    objects: [...base, { id: "toolsTrio", type: "3 ícones 2D: pedra, tronco, corda", visible: true }, { id: "personRef", type: "uma pessoa de 1,7 m ao pé de uma sarsen (escala)", visible: true }],
    animations: [
      lin("monument.built", 0, 1, 1, 1, "linear"), lin("monument.ruin", 0, 1, 0, 0, "linear"), lin("sun.phase", 0, 1, 0.5, 0.5, "linear"),
      lin("ditch.dig", 0, 1, 1, 1, "linear"), lin("ditch.chalk", 0, 1, 0, 0, "linear"), lin("heel.show", 0, 1, 1, 1, "linear"),
      lin("crew.show", 0, 1, 0, 0, "linear"),
      pop("personRef.show", W("s1", 2)),
      lin("lintels.glow", W("s1", 11), W("s1", 14) + 10, 0, 1, "out"),
      lin("lintels.glow", W("s1", 18), W("s1", 23), 1, 0, "inOut"),
      pop("toolsTrio.show", W("s1", 24)),
      ...fx.punch(W("s1", 30)),
      ...fx.whipOut(end(0)),
      ...mascot.place(g(0.75, 1.95), 0.5, MS, 0),
      ...mascot.wave(W("s1", 0), s(1.2)),
      ...mascot.jump(W("s1", 30)),
    ],
    badges: [
      { text: "~25 TONELADAS", variant: "info", subtitle: "média de cada sarsen", appearAt: W("s1", 2), disappearAt: W("s1", 15) - 2 },
      { text: "~2500 a.C.", variant: "info", subtitle: "as grandes pedras", appearAt: W("s1", 18), disappearAt: W("s1", 30) - 2 },
      { text: "COMO?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 30), disappearAt: end(0) - 2 },
    ],
    highlights: ["VINTE", "CINCO", "TONELADAS", "CÍRCULO", "QUATRO", "MIL", "PEDRA", "MADEIRA", "CORDA", "STONEHENGE"],
    captions: [cap("s1", 0, "Pedras de vinte e cinco toneladas, de pé, em círculo, com outras deitadas por cima. E tudo isso há quatro mil e quinhentos anos, só com pedra, madeira e corda. Como construíram Stonehenge?")],
    audioCues: [narration("s1"), sfx("thud", W("s1", 2), 0.24), sfx("ding", W("s1", 24), 0.2), sfx("whoosh-big", end(0) - 8, 0.26)],
  },
  // 2 — REBOBINA: 3000 a.C., só a vala (e cremações)
  {
    id: "scene-02-vala",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "No começo, por volta de três mil anos antes de Cristo, era só uma vala redonda com um barranco de terra, no sul da Inglaterra. E ali já se enterravam as cinzas dos mortos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.heroWide), key(W("s2", 11), P.ditch, "soft"), key(W("s2", 25), P.cremation, "soft"), key(end(1), P.cremation2, "soft")] },
    objects: [...base, { id: "cremations", type: "covinhas com cinzas (manchas brancas) na borda interna da vala e nos buracos de Aubrey", visible: true }, { id: "rewind", type: "efeito rebobinar: pedras afundam/somem em sequência inversa", visible: true }],
    animations: [
      ...fx.whipIn(),
      ...fx.desaturate(0, W("s2", 10) + 6, 0.5),
      lin("monument.built", 0, W("s2", 10), 1, 0, "inOut"),
      lin("heel.show", 0, W("s2", 10), 1, 0, "inOut"),
      lin("ditch.dig", 0, W("s2", 10), 1, 0, "inOut"),
      lin("ditch.dig", W("s2", 11), W("s2", 20) + 10, 0, 1, "out"),
      lin("ditch.chalk", W("s2", 11), W("s2", 20) + 10, 0, 1, "out"),
      lin("cremations.show", W("s2", 29), c(1, W("s2", 33) + 20), 0, 1, "out"),
      ...mascot.walk(W("s2", 12), W("s2", 26), g(0.75, 1.95), g(3.75, 2.35)),
    ],
    badges: [
      { text: "~3000 a.C.", variant: "info", subtitle: "a 1ª fase: vala e barranco", appearAt: W("s2", 5), disappearAt: W("s2", 25) - 2 },
      { text: "TAMBÉM UM CEMITÉRIO", variant: "info", subtitle: "cinzas de dezenas de pessoas", appearAt: W("s2", 29), disappearAt: end(1) - 2 },
    ],
    highlights: ["TRÊS", "MIL", "VALA", "REDONDA", "BARRANCO", "INGLATERRA", "CINZAS", "MORTOS"],
    captions: [cap("s2", 1, "No começo, por volta de três mil anos antes de Cristo, era só uma vala redonda com um barranco de terra, no sul da Inglaterra. E ali já se enterravam as cinzas dos mortos.")],
    audioCues: [narration("s2"), sfx("rewind", 0, 0.22), sfx("dig", W("s2", 14), 0.2), sfx("glow", W("s2", 29), 0.18)],
  },
  // 3 — PROBLEMA 1: de onde vêm as pedras? sarsens (~25 km, West Woods)
  {
    id: "scene-03-sarsens",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "Uns quinhentos anos depois, começa o difícil. Primeiro problema: de onde tirar pedras tão grandes? As gigantes, chamadas sarsens, vieram de uns vinte e cinco quilômetros ao norte.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.cremation2), key(W("s3", 7), P.mapHold, "soft"), key(end(2), P.mapHold2, "linear")] },
    objects: [...base, { id: "map", type: "MAPA 2D da Grã-Bretanha (contorno real), ponto roxo = Stonehenge; rotas animadas", visible: true }, { id: "sarsenIcon", type: "ícone de sarsen gigante com pessoa ao lado", visible: true }],
    animations: [
      lin("ditch.chalk", 0, W("s3", 6) + 20, 1, 0, "inOut"),
      ...mascot.hide(W("s3", 6)),
      lin("map.show", W("s3", 7), W("s3", 9) + 6, 0, 1, "out"),
      lin("scene.dim", W("s3", 7), W("s3", 9) + 6, 0, 0.7, "out"),
      lin("route.sarsen", W("s3", 19), W("s3", 27), 0, 1, "inOut"),
      pop("sarsenIcon.show", W("s3", 16)),
    ],
    badges: [
      { text: "PROBLEMA 1: A PEDRA", variant: "negative", subtitle: "de onde tirar?", appearAt: W("s3", 7), disappearAt: W("s3", 15) - 2 },
      { text: "SARSENS: ~25 km", variant: "positive", subtitle: "West Woods (estudo de 2020)", appearAt: W("s3", 18), disappearAt: end(2) - 2 },
    ],
    highlights: ["QUINHENTOS", "DIFÍCIL", "PRIMEIRO", "PROBLEMA", "GRANDES", "SARSENS", "VINTE", "CINCO", "NORTE"],
    captions: [cap("s3", 2, "Uns quinhentos anos depois, começa o difícil. Primeiro problema: de onde tirar pedras tão grandes? As gigantes, chamadas sarsens, vieram de uns vinte e cinco quilômetros ao norte.")],
    audioCues: [narration("s3"), sfx("buzz", W("s3", 7), 0.18), sfx("whoosh-soft", W("s3", 19), 0.2), sfx("badge", W("s3", 18), 0.22)],
  },
  // 4 — pedras azuis (Preseli, País de Gales, >200 km)
  {
    id: "scene-04-pedras-azuis",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "Já as pedras azuis, menores, vieram das colinas de Preseli, no País de Gales: mais de duzentos quilômetros. Cada uma pesa de duas a cinco toneladas.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.mapHold2), key(end(3), P.mapHold3, "linear")] },
    objects: [...base, { id: "map", type: "MAPA 2D (continua)", visible: true }, { id: "blueIcon", type: "ícone de pedra azul com pessoa ao lado", visible: true }],
    animations: [
      lin("map.zoomOut", 0, W("s4", 6), 0, 1, "inOut"),
      lin("route.blue", W("s4", 5), W("s4", 17), 0, 1, "inOut"),
      pop("blueIcon.show", W("s4", 2)),
    ],
    badges: [{ text: "PEDRAS AZUIS: +200 km", variant: "info", subtitle: "Preseli, País de Gales · 2 a 5 t cada", appearAt: W("s4", 9), disappearAt: end(3) - 2 }],
    highlights: ["PEDRAS", "AZUIS", "PRESELI", "GALES", "DUZENTOS", "QUILÔMETROS", "DUAS", "CINCO", "TONELADAS"],
    captions: [cap("s4", 3, "Já as pedras azuis, menores, vieram das colinas de Preseli, no País de Gales: mais de duzentos quilômetros. Cada uma pesa de duas a cinco toneladas.")],
    audioCues: [narration("s4"), sfx("whoosh-soft", W("s4", 5), 0.2), sfx("badge", W("s4", 9), 0.22)],
  },
  // 5 — Pedra do Altar: norte da Escócia, ≥750 km (Nature, 2024)
  {
    id: "scene-05-altar",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "E em 2024 descobriram que a Pedra do Altar, de umas seis toneladas, veio do norte da Escócia: no mínimo setecentos e cinquenta quilômetros.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.mapHold3), key(end(4), orbit([0, 0, 0], 44, -10, 40), "linear")] },
    objects: [...base, { id: "map", type: "MAPA 2D (zoom maior, Escócia inteira)", visible: true }, { id: "altarIcon", type: "ícone da Pedra do Altar deitada", visible: true }],
    animations: [
      lin("map.zoomOut2", 0, W("s5", 13), 0, 1, "inOut"),
      lin("route.altar", W("s5", 13), W("s5", 23), 0, 1, "inOut"),
      pop("altarIcon.show", W("s5", 6)),
      ...fx.shake(W("s5", 20)),
      lin("map.show", c(4, end(4) - 10), end(4), 1, 0, "in"),
      lin("scene.dim", c(4, end(4) - 10), end(4), 0.7, 0, "in"),
    ],
    badges: [{ text: "PEDRA DO ALTAR: ≥750 km", variant: "warning", subtitle: "norte da Escócia (Nature, 2024)", appearAt: W("s5", 17), disappearAt: end(4) - 2 }],
    highlights: ["2024", "PEDRA", "ALTAR", "SEIS", "ESCÓCIA", "SETECENTOS", "CINQUENTA"],
    captions: [cap("s5", 4, "E em 2024 descobriram que a Pedra do Altar, de umas seis toneladas, veio do norte da Escócia: no mínimo setecentos e cinquenta quilômetros.")],
    audioCues: [narration("s5"), sfx("whoosh-soft", W("s5", 13), 0.2), sfx("thud", W("s5", 20), 0.22)],
  },
  // 6 — PROBLEMA 2: arrastar 25 t → trenó sobre trilhos de troncos
  {
    id: "scene-06-treno",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "Segundo problema: como arrastar vinte e cinco toneladas? A hipótese mais aceita é um trenó de madeira deslizando sobre trilhos de troncos, puxado com cordas por muita gente.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, orbit([0, 0, 0], 44, -10, 40)), key(W("s6", 8), P.sledgeFar, "soft"), key(end(5), P.sledgeSide, "linear")] },
    objects: [...base, O.crew, { id: "workStone", type: "A PEDRA-MODELO: sarsen bruta deitada no trenó", visible: true, state: { start: "fora do diorama (+z)", end: "no canteiro" } }, { id: "sledge", type: "trenó de madeira + trilhos de troncos + cordas (DESIGN NOVO)", visible: true }],
    animations: [
      lin("monument.built", 0, 1, 0, 0, "linear"), lin("ditch.dig", 0, 1, 1, 1, "linear"),
      lin("stonesPile.show", 0, W("s6", 3), 0, 1, "out"),
      lin("crew.show", 0, 1, 1, 1, "linear"),
      lin("sledge.z", W("s6", 8), end(5), 6.5, 3.4, "linear", "u3d"),
      lin("crew.pull", W("s6", 22), end(5), 0, 1, "linear"),
      lin("rails.show", W("s6", 17), W("s6", 21) + 6, 0, 1, "out"),
      ...mascot.place(g(2.6, 4.4), -1.2, MS, 0, 10),
      ...mascot.walk(2, W("s6", 10), g(2.6, 4.4), g(1.3, 3.6)),
      ...mascot.point(W("s6", 14), s(1.2), -1.6),
    ],
    badges: [
      { text: "PROBLEMA 2: O PESO", variant: "negative", subtitle: "25 toneladas por pedra", appearAt: W("s6", 0), disappearAt: W("s6", 8) - 2 },
      { text: "TRENÓ + TRILHOS DE TRONCOS", variant: "positive", subtitle: "hipótese mais aceita", appearAt: W("s6", 14), disappearAt: end(5) - 2 },
    ],
    highlights: ["SEGUNDO", "PROBLEMA", "ARRASTAR", "TONELADAS", "HIPÓTESE", "TRENÓ", "MADEIRA", "TRILHOS", "TRONCOS", "CORDAS", "GENTE"],
    captions: [cap("s6", 5, "Segundo problema: como arrastar vinte e cinco toneladas? A hipótese mais aceita é um trenó de madeira deslizando sobre trilhos de troncos, puxado com cordas por muita gente.")],
    audioCues: [narration("s6"), sfx("buzz", W("s6", 0), 0.18), sfx("rumble-soft", W("s6", 22), 0.22), sfx("badge", W("s6", 14), 0.22)],
  },
  // 7 — honestidade: testes só com pedras menores; ninguém sabe quantos/quanto tempo
  {
    id: "scene-07-incerteza",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "Testes modernos mostram que funciona, mas sempre com pedras bem menores que as maiores de lá. Quantas pessoas e quanto tempo, ninguém sabe ao certo.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.sledgeSide), key(end(6), P.sledgeOut, "linear")] },
    objects: [...base, O.crew, { id: "workStone", type: "pedra-modelo no trenó (continua)", visible: true }, { id: "sledge", type: "trenó (continua)", visible: true }, { id: "compare", type: "camada 2D: blocos lado a lado — 'testes' (pequeno) × 'maior sarsen' (~30 t)", visible: true }, { id: "qmarks", type: "pessoas viram silhuetas com '?' em volta (contagem desconhecida)", visible: true }],
    animations: [
      lin("sledge.z", 0, end(6), 3.4, 2.6, "linear", "u3d"),
      pop("compare.show", W("s7", 5)),
      lin("compare.show", W("s7", 16) - 8, W("s7", 16), 1, 0, "in"),
      lin("crew.unknown", W("s7", 16), W("s7", 21) + 8, 0, 1, "out"),
      ...mascot.look(W("s7", 21), 0.5),
      ...mascot.hide(end(6) - 10),
    ],
    badges: [{ text: "NINGUÉM SABE AO CERTO", variant: "warning", icon: "?", subtitle: "quantas pessoas · quanto tempo", appearAt: W("s7", 16), disappearAt: end(6) - 2 }],
    highlights: ["TESTES", "FUNCIONA", "MENORES", "MAIORES", "PESSOAS", "TEMPO", "NINGUÉM", "CERTO"],
    captions: [cap("s7", 6, "Testes modernos mostram que funciona, mas sempre com pedras bem menores que as maiores de lá. Quantas pessoas e quanto tempo, ninguém sabe ao certo.")],
    audioCues: [narration("s7"), sfx("pop-high", W("s7", 5), 0.18), sfx("pop", W("s7", 16), 0.2)],
  },
  // 8 — PROBLEMA 3: pedra bruta → martelos de pedra (lascar e alisar)
  {
    id: "scene-08-martelos",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "Terceiro problema: a pedra chegava bruta. Eles batiam nela com martelos de pedra: os grandes lascavam, os pequenos alisavam. Esses martelos foram achados no próprio local.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.sledgeOut), key(W("s8", 6), P.hammer, "soft"), key(end(7), P.hammer2, "soft")] },
    objects: [...base, O.crew, { id: "workStone", type: "pedra-modelo: de bruta (facetada irregular) para alisada, com o pino (espiga) no topo", visible: true, state: { start: "bruta", end: "alisada" } }, { id: "hammers", type: "martelos de pedra: grandes (cabeça de ~30 cm) e pequenos (~10 cm) (DESIGN NOVO)", visible: true }, { id: "chips", type: "lascas cinzentas saltando a cada golpe", visible: true }],
    animations: [
      lin("workStone.rough", 0, 1, 1, 1, "linear"),
      lin("hammer.big", W("s8", 13), W("s8", 16), 0, 1, "linear"),
      lin("workStone.rough", W("s8", 13), W("s8", 18) + 10, 1, 0, "inOut"),
      lin("hammer.small", W("s8", 16), W("s8", 19), 0, 1, "linear"),
      lin("workStone.tenon", W("s8", 18), W("s8", 19) + 10, 0, 1, "out"),
      pop("hammersFound.show", W("s8", 19)),
      ...fx.shake(W("s8", 7)),
    ],
    badges: [
      { text: "PROBLEMA 3: PEDRA BRUTA", variant: "negative", appearAt: W("s8", 0), disappearAt: W("s8", 6) - 2 },
      { text: "MARTELOS DE PEDRA", variant: "positive", subtitle: "grandes lascam · pequenos alisam", appearAt: W("s8", 10), disappearAt: W("s8", 19) - 2 },
      { text: "ACHADOS NO LOCAL", variant: "info", subtitle: "English Heritage", appearAt: W("s8", 19), disappearAt: end(7) - 2 },
    ],
    highlights: ["TERCEIRO", "PROBLEMA", "BRUTA", "MARTELOS", "PEDRA", "GRANDES", "LASCAVAM", "PEQUENOS", "ALISAVAM", "ACHADOS"],
    captions: [cap("s8", 7, "Terceiro problema: a pedra chegava bruta. Eles batiam nela com martelos de pedra: os grandes lascavam, os pequenos alisavam. Esses martelos foram achados no próprio local.")],
    audioCues: [narration("s8"), sfx("buzz", W("s8", 0), 0.18), sfx("tick", W("s8", 13), 0.24), sfx("tick", W("s8", 14), 0.2), sfx("tick", W("s8", 17), 0.2), sfx("badge", W("s8", 19), 0.22)],
  },
  // 9 — PROBLEMA 4: erguer → buraco com lado inclinado, cordas e escoras
  {
    id: "scene-09-erguer",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "Quarto problema: pôr de pé um bloco gigante. Cavava-se um buraco com um lado inclinado, a pedra escorregava para dentro, e cordas e escoras terminavam de erguer.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.pitFront), key(W("s9", 8), P.pit, "soft"), key(end(8), P.pitEnd, "soft")] },
    objects: [...base, O.crew, { id: "pit", type: "vala escavada: rampa de giz descendo até o buraco + monte de terra retirada", visible: true }, { id: "workStone", type: "pedra-modelo: deitada → inclinada → em pé no buraco", visible: true, state: { start: "tilt 0°", end: "tilt 90°" } }, { id: "props", type: "escoras de madeira (cavalete em A) + cordas (DESIGN NOVO)", visible: true }],
    animations: [
      lin("pit.dig", W("s9", 8), W("s9", 14) + 6, 0, 1, "out"),
      lin("pit.cut", W("s9", 8), W("s9", 10), 0, 1, "out"),
      lin("workStone.slide", W("s9", 15), W("s9", 19) + 6, 0, 1, "in"),
      lin("workStone.tilt", W("s9", 15), W("s9", 19) + 6, 0, 35, "in", "deg"),
      lin("workStone.tilt", W("s9", 20), c(8, W("s9", 26) + 20), 35, 90, "inOut", "deg"),
      lin("props.show", W("s9", 20), W("s9", 23) + 6, 0, 1, "out"),
      lin("crew.pull", W("s9", 20), c(8, W("s9", 26) + 20), 0, 1, "linear"),
      ...fx.shake(c(8, W("s9", 26) + 20)),
    ],
    badges: [
      { text: "PROBLEMA 4: ERGUER", variant: "negative", subtitle: "as mais altas: +6 m acima do chão", appearAt: W("s9", 0), disappearAt: W("s9", 8) - 2 },
      { text: "BURACO COM RAMPA + ESCORAS", variant: "positive", subtitle: "hipótese mais aceita", appearAt: W("s9", 10), disappearAt: end(8) - 2 },
    ],
    highlights: ["QUARTO", "PROBLEMA", "PÉ", "GIGANTE", "BURACO", "INCLINADO", "ESCORREGAVA", "CORDAS", "ESCORAS", "ERGUER"],
    captions: [cap("s9", 8, "Quarto problema: pôr de pé um bloco gigante. Cavava-se um buraco com um lado inclinado, a pedra escorregava para dentro, e cordas e escoras terminavam de erguer.")],
    audioCues: [narration("s9"), sfx("buzz", W("s9", 0), 0.18), sfx("dig", W("s9", 8), 0.2), sfx("crumble", W("s9", 15), 0.22), sfx("thud", c(8, W("s9", 26) + 20), 0.26)],
  },
  // 10 — PROBLEMA 5: lintel lá em cima → plataforma de madeira que cresce
  {
    id: "scene-10-plataforma",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "Quinto problema: a pedra deitada, de umas sete toneladas, vai lá em cima. O mais provável é uma plataforma de madeira: sobe a pedra um pouco, põe madeira embaixo, e repete até o topo.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.pitEnd), key(W("s10", 13), P.platform, "soft"), key(end(9), P.platformTop, "soft")] },
    objects: [...base, O.crew, { id: "neighbor", type: "segunda pedra em pé ao lado da pedra-modelo (par para o lintel)", visible: true }, { id: "lintel", type: "lintel curvo (~7 t) com 2 buracos (encaixes) embaixo", visible: true, state: { start: "no chão", end: "no topo" } }, { id: "crib", type: "plataforma de troncos cruzados que cresce camada por camada (DESIGN NOVO)", visible: true }],
    animations: [
      lin("neighbor.show", 0, W("s10", 4), 0, 1, "out"),
      pop("lintel.show", W("s10", 2)),
      lin("pit.cut", 0, 20, 1, 0, "inOut"),
      lin("crib.layers", W("s10", 17), c(9, W("s10", 33) + 10), 0, 12, "linear"),
      lin("lintel.y", W("s10", 21), c(9, W("s10", 33) + 10), 0, 0.435, "linear", "u3d"),
      lin("crew.lever", W("s10", 21), c(9, W("s10", 33) + 10), 0, 1, "linear"),
      ...mascot.place(g(1.6, 2.6), -0.9, MS, 0, 10),
      ...mascot.point(W("s10", 18), s(1.2)),
      ...mascot.hide(end(9) - 10),
    ],
    badges: [
      { text: "PROBLEMA 5: O LINTEL", variant: "negative", subtitle: "~7 t a ~4 m de altura", appearAt: W("s10", 0), disappearAt: W("s10", 13) - 2 },
      { text: "PLATAFORMA DE MADEIRA", variant: "positive", subtitle: "sobe um pouco · calça · repete", appearAt: W("s10", 17), disappearAt: end(9) - 2 },
    ],
    highlights: ["QUINTO", "PROBLEMA", "DEITADA", "SETE", "TONELADAS", "PLATAFORMA", "MADEIRA", "SOBE", "EMBAIXO", "REPETE", "TOPO"],
    captions: [cap("s10", 9, "Quinto problema: a pedra deitada, de umas sete toneladas, vai lá em cima. O mais provável é uma plataforma de madeira: sobe a pedra um pouco, põe madeira embaixo, e repete até o topo.")],
    audioCues: [narration("s10"), sfx("buzz", W("s10", 0), 0.18), sfx("clunk", W("s10", 21), 0.2), sfx("clunk", W("s10", 26), 0.2), sfx("clunk", W("s10", 30), 0.2)],
  },
  // 11 — encaixes de marcenaria em pedra (vista explodida)
  {
    id: "scene-11-encaixes",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "E para nada escorregar, copiaram a marcenaria: buracos na pedra de cima encaixam em pinos das pedras em pé, e as pontas se encaixam umas nas outras, como num móvel.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.platformTop), key(W("s11", 6), P.joint, "soft"), key(end(10), P.joint2, "soft")] },
    objects: [...base, { id: "lintel", type: "lintel (continua)", visible: true }, { id: "lintel2", type: "lintel vizinho (para mostrar a lingueta e ranhura)", visible: true }, { id: "jointLabels", type: "rótulos 3D: 'pino (espiga)', 'buraco (encaixe)', 'lingueta e ranhura'", visible: true }],
    animations: [
      lin("crib.fade", 0, W("s11", 4), 1, 0, "inOut"),
      lin("joint.explode", W("s11", 7), W("s11", 12) + 6, 0, 1, "out"),
      lin("joint.explode", W("s11", 14) + 6, W("s11", 18) + 6, 1, 0, "inOut"),
      lin("lintel2.slide", W("s11", 20), W("s11", 26) + 6, 0, 1, "inOut"),
      ...fx.punch(W("s11", 12)),
    ],
    badges: [
      { text: "ENCAIXE DE MARCENARIA", variant: "info", subtitle: "pino e buraco · lingueta e ranhura", appearAt: W("s11", 6), disappearAt: W("s11", 27) - 2 },
      { text: "EM PEDRA!", variant: "warning", subtitle: "técnica de quem trabalha madeira", appearAt: W("s11", 27), disappearAt: end(10) - 2 },
    ],
    highlights: ["ESCORREGAR", "MARCENARIA", "BURACOS", "ENCAIXAM", "PINOS", "PONTAS", "MÓVEL"],
    captions: [cap("s11", 10, "E para nada escorregar, copiaram a marcenaria: buracos na pedra de cima encaixam em pinos das pedras em pé, e as pontas se encaixam umas nas outras, como num móvel.")],
    audioCues: [narration("s11"), sfx("click", W("s11", 12), 0.24), sfx("click", W("s11", 23), 0.24)],
  },
  // 12 — anel curvo: Ø 30 m a 4 m do chão (o monumento se completa)
  {
    id: "scene-12-anel",
    startFrame: sc(11).from,
    durationInFrames: sc(11).durationInFrames,
    voKey: "s12",
    narration: "As pedras de cima são até levemente curvas, formando um anel de trinta metros, suspenso a quatro metros do chão.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.joint2), key(W("s12", 8), P.ring, "soft"), key(end(11), P.ringLow, "soft")] },
    objects: [...base, O.crew, { id: "ringDims", type: "cotas 3D: diâmetro 30 m (seta atravessando o anel) e altura 4 m (seta vertical com pessoa ao lado)", visible: true }],
    animations: [
      lin("monument.built", W("s12", 6), W("s12", 10) + 10, 0, 1, "inOut"),
      lin("heel.show", W("s12", 6), W("s12", 10) + 10, 0, 1, "inOut"),
      lin("lintels.glow", W("s12", 5), W("s12", 7) + 8, 0, 1, "out"),
      lin("lintels.glow", W("s12", 14), W("s12", 19), 1, 0, "inOut"),
      lin("ringDims.diameter", W("s12", 11), W("s12", 13) + 8, 0, 1, "out"),
      lin("ringDims.height", W("s12", 14), W("s12", 17) + 8, 0, 1, "out"),
      ...fx.burst("ring", W("s12", 10)),
    ],
    badges: [{ text: "ANEL: Ø 30 m · A 4 m DO CHÃO", variant: "positive", subtitle: "lintéis curvos", appearAt: W("s12", 10), disappearAt: end(11) - 2 }],
    highlights: ["CURVAS", "ANEL", "TRINTA", "METROS", "QUATRO", "CHÃO"],
    captions: [cap("s12", 11, "As pedras de cima são até levemente curvas, formando um anel de trinta metros, suspenso a quatro metros do chão.")],
    audioCues: [narration("s12"), sfx("shimmer", W("s12", 6), 0.2), sfx("final", W("s12", 10), 0.22)],
  },
  // 13 — POR QUÊ: alinhamento com o Sol (nascente de verão / poente de inverno)
  {
    id: "scene-13-sol",
    startFrame: sc(12).from,
    durationInFrames: sc(12).durationInFrames,
    voKey: "s13",
    narration: "Mas por que tanto trabalho? O monumento está alinhado com o Sol. No dia mais longo do ano, o Sol nasce perto da Pedra do Calcanhar. No mais curto, se põe do lado oposto.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.ringLow), key(W("s13", 5), P.heroWide, "soft"), key(W("s13", 12), P.axisDawn, "soft"), key(W("s13", 26) - 1, orbit([7.8, 0.2, 0], 7.6, -90, 0.3), "linear"), key(W("s13", 26), P.axisDusk, "linear"), key(end(12), P.axisDusk2, "linear")] },
    objects: [...base, { id: "axis", type: "linha de luz roxa clara no chão: eixo do solstício (atravessa o centro e a Pedra do Calcanhar)", visible: true }, { id: "sun", type: "Sol low-poly no horizonte do diorama; céu muda (madrugada dourada → pôr do sol alaranjado)", visible: true }],
    animations: [
      lin("crew.show", 0, s(0.8), 1, 0, "out"),
      lin("axis.show", W("s13", 6), W("s13", 8) + 8, 0, 1, "out"),
      lin("sun.phase", W("s13", 12), W("s13", 20) + 10, 0.5, 0.0, "inOut"), // 0 = nascente de verão (NE, +x)
      lin("sun.rise", W("s13", 18), W("s13", 25) + 6, 0, 1, "out"),
      lin("axis.show", W("s13", 12), W("s13", 14), 1, 0, "inOut"),
      lin("sun.phase", W("s13", 26), c(12, W("s13", 33) + 10), 0.0, 1.0, "inOut"), // 1 = poente de inverno (SO, −x)
      ...fx.flash(W("s13", 26)),
    ],
    badges: [
      { text: "POR QUÊ?", variant: "warning", icon: "?", appearAt: W("s13", 0), disappearAt: W("s13", 5) - 2 },
      { text: "ALINHADO COM O SOL", variant: "info", subtitle: "eixo dos solstícios", appearAt: W("s13", 6), disappearAt: W("s13", 12) - 2 },
      { text: "NASCER DO SOL · VERÃO", variant: "info", subtitle: "perto da Pedra do Calcanhar", appearAt: W("s13", 18), disappearAt: W("s13", 26) - 2 },
      { text: "PÔR DO SOL · INVERNO", variant: "info", subtitle: "do lado oposto, no mesmo eixo", appearAt: W("s13", 26), disappearAt: end(12) - 2 },
    ],
    highlights: ["TRABALHO", "ALINHADO", "SOL", "LONGO", "NASCE", "PEDRA", "CALCANHAR", "CURTO", "OPOSTO"],
    captions: [cap("s13", 12, "Mas por que tanto trabalho? O monumento está alinhado com o Sol. No dia mais longo do ano, o Sol nasce perto da Pedra do Calcanhar. No mais curto, se põe do lado oposto.")],
    audioCues: [narration("s13"), sfx("glow", W("s13", 6), 0.2), sfx("shimmer", W("s13", 18), 0.22), sfx("whoosh", W("s13", 26), 0.22)],
  },
  // 14 — o poente de inverno como grande momento (os dias voltam a crescer)
  {
    id: "scene-14-inverno",
    startFrame: sc(13).from,
    durationInFrames: sc(13).durationInFrames,
    voKey: "s14",
    narration: "Para muitos arqueólogos, esse pôr do sol de inverno era o grande momento: dali em diante, os dias voltam a crescer.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.axisDusk2), key(end(13), P.dusk, "soft")] },
    objects: [...base, { id: "sun", type: "Sol se pondo entre as pedras do Grande Trilito, raios atravessando o monumento", visible: true }, { id: "dayBar", type: "camada 2D: barra 'duração do dia' que para de encolher e volta a crescer", visible: true }],
    animations: [
      lin("sun.set", 0, W("s14", 12), 0, 1, "inOut"),
      lin("axis.show", 0, 20, 1, 0, "inOut"),
      lin("sunRays.show", W("s14", 3), W("s14", 8) + 10, 0, 1, "out"),
      pop("dayBar.show", W("s14", 13)),
      lin("dayBar.value", W("s14", 13), c(13, W("s14", 20) + 20), 0, 1, "inOut"),
      ...mascot.place(g(-0.95, 0.32), -Math.PI / 2, MS, 0, 10),
      ...mascot.cheer(W("s14", 17), s(1.4)),
    ],
    badges: [{ text: "OS DIAS VOLTAM A CRESCER", variant: "positive", subtitle: "solstício de inverno (interpretação)", appearAt: W("s14", 13), disappearAt: end(13) - 2 }],
    highlights: ["ARQUEÓLOGOS", "PÔR", "SOL", "INVERNO", "GRANDE", "MOMENTO", "DIAS", "CRESCER"],
    captions: [cap("s14", 13, "Para muitos arqueólogos, esse pôr do sol de inverno era o grande momento: dali em diante, os dias voltam a crescer.")],
    audioCues: [narration("s14"), sfx("glow", W("s14", 4), 0.2), sfx("shimmer", W("s14", 13), 0.2)],
  },
  // 15 — HOJE: ruína + mil anos de obra + PRONTO (+ encerramento fixo da marca nos últimos ~4,7 s)
  {
    id: "scene-15-final",
    startFrame: sc(14).from,
    durationInFrames: sc(14).durationInFrames,
    voKey: "s15",
    narration: "Hoje, muitas pedras caíram ou sumiram. E do primeiro buraco à última pedra mexida, foram mais de mil anos de obra. Pronto: agora você sabe como se ergueu Stonehenge, só com pedra, madeira e corda.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.ruin), key(W("s15", 6), P.ruin2, "soft"), key(W("s15", 21), P.final, "soft"), key(end(14), P.final2, "linear")] },
    objects: [...base, { id: "ghost", type: "fantasma translúcido do monumento completo sobre a ruína (contraste ontem × hoje)", visible: true }, { id: "timeline", type: "camada 2D: linha do tempo 3000 a.C. → ~1500 a.C. com as fases acendendo", visible: true }],
    animations: [
      lin("sun.phase", 0, s(1.0), 1.0, 0.5, "inOut"),
      lin("sunRays.show", 0, s(0.8), 1, 0, "inOut"),
      lin("monument.ruin", W("s15", 1), W("s15", 5) + 10, 0, 1, "inOut"),
      lin("ghost.show", W("s15", 3), W("s15", 6), 0, 0.35, "out"),
      pop("timeline.show", W("s15", 7)),
      lin("timeline.progress", W("s15", 7), W("s15", 20), 0, 1, "linear"),
      lin("timeline.show", W("s15", 21) - 6, W("s15", 21), 1, 0, "in"),
      lin("ghost.show", W("s15", 21), W("s15", 27), 0.35, 1, "inOut"),
      ...mascot.place(g(0.75, 1.95), 0.5, MS, 0),
      ...mascot.cheer(W("s15", 21), s(1.6)),
      ...fx.burst("final", W("s15", 27)),
    ],
    badges: [
      { text: "HOJE: RUÍNA PARCIAL", variant: "negative", subtitle: "pedras caídas ou levadas", appearAt: W("s15", 0), disappearAt: W("s15", 7) - 2 },
      { text: "+1.000 ANOS DE OBRA", variant: "info", subtitle: "~3000 a.C. a ~1500 a.C.", appearAt: W("s15", 14), disappearAt: W("s15", 21) - 2 },
      { text: "PEDRA · MADEIRA · CORDA", variant: "positive", appearAt: W("s15", 29), disappearAt: W("s15", 34) + 30 },
    ],
    highlights: ["HOJE", "CAÍRAM", "SUMIRAM", "PRIMEIRO", "ÚLTIMA", "MIL", "ANOS", "PRONTO", "STONEHENGE", "PEDRA", "MADEIRA", "CORDA"],
    captions: [cap("s15", 14, "Hoje, muitas pedras caíram ou sumiram. E do primeiro buraco à última pedra mexida, foram mais de mil anos de obra. Pronto: agora você sabe como se ergueu Stonehenge, só com pedra, madeira e corda.")],
    audioCues: [narration("s15"), sfx("rumble", W("s15", 1), 0.2), sfx("final", W("s15", 21), 0.28)],
  },
];

/** Valor de uma trilha (ex.: "workStone.tilt" em graus) no frame global. */
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
