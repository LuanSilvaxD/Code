// scene-plan.ts — "Vai ter apagão mundial em 17 de novembro?" — Boato ou Verdade? EP. 01 (nome a confirmar)
// Roteiro v1 (1:55) — AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa até o TTS);
// c(i, f) prende a âncora ao fim da cena. Linha do tempo determinística (sem timers / Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 115;   // 3450 frames
//   export const VO_KEYS = ["s1", ..., "s14"] as const;
//   const PLANNED_SECONDS = [7.07, 1.94, 7.70, 6.80, 7.97, 6.84, 8.98, 4.98, 9.70, 7.94, 6.00, 6.98, 6.32, 9.76];
//   const GAPS = [0.55, 0.8, 0.55, 0.55, 0.8, 0.55, 0.55, 0.8, 0.55, 0.8, 0.55, 0.55, 0.8];
//   Cortes planejados: 0, 250, 332, 579, 800, 1063, 1285, 1570, 1744, 2051, 2314, 2510, 2736, 2950 · outro 3285–3450
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4% (cta +0%); no texto do TTS ":" → ",". A voz real decide os cortes.
// ----------------------------------------------------------------------------------------------
//
// NOVOS NO MOTOR (Fase 2): pose `mascot.sit` (sentado no sofá; hoje existem place/hide/walk/turn/wave/point/jump/cheer/float/look).
//
// MUNDOS (lado a lado no mesmo Canvas, a câmera viaja entre eles):
//   ESPAÇO  — globo noturno em [0, 0, 0], raio 3 u3d (luzes das cidades; modo "redes" com regiões coloridas).
//             Sol em [−26, 2, −6] (raio 4, low-poly, ESQUEMA: distância e tamanho fora de escala).
//             Satélite em [−12, 1.5, −2]. Campo magnético: anéis em volta do globo.
//   SALA    — em [30, 0, 0]. Régua 1 m = 0,35 u3d (worldScale(0.35)): TV de 1,2 m de largura = 0,42 u3d;
//             sofá 2 m = 0,7 u3d; mascote sentado (1,6 m em pé). A tela da TV é uma textura 2D (CanvasTexture).
//   ITAIPU  — em [0, −30, 0]. ESQUEMA: barragem de 8 u3d de largura, 20 rotores (r 0,18) em fila no corte.
//   BRASIL  — em [60, 0, 0]. Placas extrudadas por estado (altura 0,12), mapa com ~10 u3d de largura
//             (ESQUEMA). Mascote na borda do pedestal como visitante (regra de escala esquemática).

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-tecnologia", language: "pt-BR" };

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
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");

// ---- Posições dos mundos ----
export const GLOBE: Vec3 = [0, 0, 0];
export const GLOBE_R = 3;
export const SUN: Vec3 = [-26, 2, -6];
export const SATELLITE: Vec3 = [-12, 1.5, -2];
export const ROOM: Vec3 = [30, 0, 0];
export const ROOM_U = 0.35; // 1 m na sala
export const ITAIPU: Vec3 = [0, -30, 0];
export const BRAZIL: Vec3 = [60, 0, 0];
/** lon/lat → ponto na superfície do globo (implementado em components/Globe.tsx na Fase 2). */
export const LL = { southAmerica: [-58, -15], brazil: [-50, -10], paraguay: [-58, -23], quebec: [-72, 50], ceara: [-39.5, -5], roraima: [-61, 2] } as const;

// Âncoras do mapa do Brasil (u3d, relativas a BRAZIL; posições finais vêm da projeção dos contornos na Fase 2)
export const MAP = { ceara: [3.6, 0.15, -2.4] as Vec3, roraima: [-2.6, 0.15, -3.9] as Vec3, center: [0, 0, 0] as Vec3 };

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const P = {
  globeMid: orbit(GLOBE, 11, 20, 12),
  globeWide: orbit(GLOBE, 14, 26, 14),
  globePunch: orbit(GLOBE, 9.5, 18, 10),
  globeBlur: orbit(GLOBE, 13, 10, 6),
  globeFull: orbit(GLOBE, 13, 25, 16),
  southAmerica: orbit([-1.6, -0.6, 2.4], 6.5, -30, 10),
  roomWide: orbit(add(ROOM, [0, 0.35, 0]), 3.2, 15, 8),
  roomTv: orbit(add(ROOM, [0, 0.45, -0.6]), 2.4, 10, 6),
  roomSide: orbit(add(ROOM, [0.2, 0.4, -0.4]), 2.8, 30, 10),
  tvScreen: orbit(add(ROOM, [0, 0.5, -0.9]), 0.7, 0, 0),
  itaipuStart: orbit(add(ITAIPU, [-3, 0.5, 0]), 6, 30, 18),
  itaipuEnd: orbit(add(ITAIPU, [3, 0.5, 0]), 6, 30, 18),
  brazilWide: orbit(add(BRAZIL, MAP.center), 14, 15, 50),
  brazilCeara: orbit(add(BRAZIL, MAP.ceara), 8, 20, 48),
  brazilRoraima: orbit(add(BRAZIL, MAP.roraima), 7, 10, 45),
  brazilLines: orbit(add(BRAZIL, MAP.center), 13, 0, 55),
  sunAndEarth: orbit([-13, 1, -3], 26, -20, 10),
  cmeMid: orbit([-10, 1, -2], 18, -10, 8),
  canada: orbit([-1.8, 2.2, 1.6], 6, -40, 22),
  satellite: orbit([-12, 1.5, -2], 20, -15, 10),
  finalOrbit0: orbit(GLOBE, 12, 0, 12),
  finalOrbit1: orbit(GLOBE, 12, 40, 14),
};

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Dia 17 de novembro, o mundo inteiro vai ficar sem luz. É o que tá rodando na internet. Será verdade?",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.globeMid), key(W("s1", 9), P.globeMid), key(W("s1", 11), P.globeWide, "inOut"), key(W("s1", 18), P.globeWide), key(W("s1", 19), P.globePunch, "out"), key(end(0), P.globePunch, "linear")] },
    objects: [
      { id: "globe", type: "NightGlobe(city lights)", visible: true, state: { start: "aceso", end: "aceso (apaga e volta)" } },
      { id: "stars", type: "Starfield", visible: true }, { id: "posts", type: "Overlay(cards de post viral genéricos)", visible: true },
      { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [
      ...fx.flash(0), set("space.show", 0, 1), set("room.show", 0, 0), set("brazil.show", 0, 0), set("itaipu.show", 0, 0), set("grids.k", 0, 0),
      set("lights.on", 0, 1), mascot.float(0)[0], mascot.wave(W("s1", 1), 30)[0],
      lin("lights.on", W("s1", 9), W("s1", 10) + 20, 1, 0), pop("posts.cards", W("s1", 15)),
      lin("lights.on", W("s1", 18), W("s1", 18) + 15, 0, 1, "out"), ...fx.punch(W("s1", 19)),
    ],
    badges: [
      { text: "APAGÃO MUNDIAL EM 17/11?", variant: "warning", icon: "?", appearAt: W("s1", 4), disappearAt: W("s1", 15) },
      { text: "TÁ NA INTERNET", variant: "warning", appearAt: W("s1", 15), disappearAt: W("s1", 18) },
      { text: "SERÁ VERDADE?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 18) },
    ],
    highlights: ["17 de novembro", "mundo inteiro", "sem luz", "verdade"],
    captions: [cap("s1", 0, "Dia 17 de novembro, o mundo inteiro vai ficar sem luz. É o que tá rodando na internet. Será verdade?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("power-down", W("s1", 9), 0.5), sfx("pop", W("s1", 15), 0.35), sfx("hum", W("s1", 18), 0.3), sfx("thud", W("s1", 19), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Este é o Boato ou Verdade.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.globeBlur), key(end(1), orbit(GLOBE, 12.5, 14, 7), "linear")] },
    objects: [
      { id: "seriesCard", type: "SeriesCard(BOATO OU VERDADE? · EP. 01)", visible: true },
      { id: "verdict", type: "VerdictMeter2D(BOATO ✖ ↔ VERDADE ✔)", visible: true, state: { start: "oculto", end: "ponteiro no meio, balançando" } },
      { id: "globe", type: "NightGlobe", visible: true },
    ],
    animations: [pop("series.card", W("s2", 0)), lin("verdict.show", W("s2", 2), W("s2", 2) + 10, 0, 1, "out"), set("verdict.needle", 0, 0), pop("verdict.wobble", W("s2", 3)), lin("series.card", c(1, end(1) - 8), end(1), 1, 0)],
    badges: [],
    highlights: ["Boato", "Verdade"],
    captions: [cap("s2", 1, "Este é o Boato ou Verdade.")],
    audioCues: [narration("s2"), sfx("badge", W("s2", 0), 0.5), sfx("tick", W("s2", 3), 0.3), sfx("whoosh-soft", c(1, end(1) - 8), 0.35)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Ela junta duas coisas. Um episódio dos Simpsons, de 2023, em que a cidade fica seis dias no escuro a partir de 17 de novembro.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.roomWide), key(end(2), P.roomTv, "inOut")] },
    objects: [
      { id: "room", type: "LivingRoom(TV, rack, sofá, rádio, abajur)", visible: true },
      { id: "tv", type: "TV(screen: cidade genérica + calendário)", visible: true, state: { start: "desligada", end: "cidade apagada + 17 NOV" } },
      { id: "mascot", type: "Mascot(sentado no sofá, de costas)", visible: true },
    ],
    animations: [
      ...fx.whipIn(), set("space.show", 0, 0), set("room.show", 0, 1), set("tv.alert", 0, 0), set("tv.cross1", 0, 0), set("tv.cross2", 0, 0),
      mascot.sit(0)[0], lin("tv.on", W("s3", 4), W("s3", 4) + 10, 0, 1, "out"), lin("tv.city.dark", W("s3", 17), W("s3", 18) + 10, 0, 1), pop("tv.calendar", W("s3", 22)),
    ],
    badges: [
      { text: "PISTA 1: EPISÓDIO DE 2023", variant: "info", appearAt: W("s3", 4), disappearAt: W("s3", 15) },
      { text: "17/11 + 6 DIAS NO ESCURO", variant: "info", appearAt: W("s3", 15) },
    ],
    highlights: ["duas coisas", "Simpsons", "2023", "seis dias", "17 de novembro"],
    captions: [cap("s3", 2, "Ela junta duas coisas. Um episódio dos Simpsons, de 2023, em que a cidade fica seis dias no escuro a partir de 17 de novembro.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.45), sfx("tv-on", W("s3", 4), 0.45), sfx("power-down", W("s3", 17), 0.3), sfx("tick", W("s3", 22), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "E um teste real: nesse dia, os Estados Unidos disparam um alerta de emergência de teste nas TVs e rádios.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.roomTv), key(end(3), P.roomSide, "inOut")] },
    objects: [
      { id: "tv", type: "TV(screen: faixa TESTE DE ALERTA DE EMERGÊNCIA)", visible: true, state: { start: "calendário", end: "faixa de alerta piscando" } },
      { id: "radio", type: "Radio(ondas 2D)", visible: true }, { id: "mascot", type: "Mascot(sofá)", visible: true },
    ],
    animations: [lin("tv.alert", W("s4", 9), W("s4", 9) + 8, 0, 1, "out"), pop("radio.waves", W("s4", 17)), mascot.jump(W("s4", 11))[0], ...fx.shake(W("s4", 11), 8)],
    badges: [
      { text: "PISTA 2: TESTE REAL NOS EUA", variant: "info", appearAt: W("s4", 2), disappearAt: W("s4", 14) },
      { text: "SÓ UM TESTE, EM TVs E RÁDIOS", variant: "info", appearAt: W("s4", 14) },
    ],
    highlights: ["teste real", "Estados Unidos", "alerta", "TVs", "rádios"],
    captions: [cap("s4", 3, "E um teste real: nesse dia, os Estados Unidos disparam um alerta de emergência de teste nas TVs e rádios.")],
    audioCues: [narration("s4"), sfx("alert-tone", W("s4", 9), 0.3), sfx("buzz", W("s4", 17), 0.25)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Só que o desenho não fala de 2026, nem do mundo. E o teste não desliga nada. Mas dá pra apagar o planeta inteiro de uma vez?",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.roomSide), key(W("s5", 17), P.roomTv, "inOut"), key(W("s5", 17) + 8, P.tvScreen, "in"), key(W("s5", 17) + 9, orbit(GLOBE, 5, 20, 12)), key(c(4, W("s5", 23)), P.globeFull, "out"), key(end(4), P.globeFull, "linear")] },
    objects: [
      { id: "tv", type: "TV", visible: true }, { id: "crosses", type: "Overlay(✖ sobre calendário e faixa)", visible: true },
      { id: "verdict", type: "VerdictMeter2D", visible: true, state: { start: "meio", end: "inclinado para BOATO (−35°)" } },
      { id: "globe", type: "NightGlobe", visible: true, state: { start: "oculto (sala)", end: "inteiro" } }, { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      pop("tv.cross1", W("s5", 7)), pop("tv.cross2", W("s5", 16)), lin("verdict.show", W("s5", 4), W("s5", 4) + 10, 0, 1, "out"),
      lin("verdict.needle", W("s5", 7), W("s5", 16), 0, -35, "out", "deg"), lin("verdict.show", W("s5", 17), W("s5", 17) + 8, 1, 0),
      ...fx.punch(W("s5", 17), 8), set("room.show", W("s5", 17) + 9, 0), set("space.show", W("s5", 17) + 9, 1), mascot.float(W("s5", 17) + 9)[0],
    ],
    badges: [
      { text: "NÃO FALA DE 2026", variant: "negative", appearAt: W("s5", 7), disappearAt: W("s5", 16) },
      { text: "O TESTE NÃO DESLIGA NADA", variant: "negative", appearAt: W("s5", 16), disappearAt: W("s5", 18) },
      { text: "DÁ PRA APAGAR O PLANETA?", variant: "warning", icon: "?", size: "large", appearAt: W("s5", 18) },
    ],
    highlights: ["2026", "mundo", "desliga nada", "planeta inteiro"],
    captions: [cap("s5", 4, "Só que o desenho não fala de 2026, nem do mundo. E o teste não desliga nada. Mas dá pra apagar o planeta inteiro de uma vez?")],
    audioCues: [narration("s5"), sfx("buzz", W("s5", 7), 0.35), sfx("buzz", W("s5", 16), 0.35), sfx("whoosh-big", W("s5", 17), 0.45)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Pra isso, a Terra precisaria de uma rede elétrica só. Ela não existe. Cada região tem a sua.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.globeFull), key(end(5), orbit(GLOBE, 12.5, 40, 18), "inOut")] },
    objects: [
      { id: "globe", type: "NightGlobe", visible: true, state: { start: "luzes", end: "regiões coloridas por rede (ESQUEMA)" } },
      { id: "cable", type: "WorldCable+Plug", visible: true, state: { start: "oculto", end: "partido e sumido" } },
      { id: "seal", type: "Seal(ESQUEMA)", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [lin("cable.on", W("s6", 6), W("s6", 9), 0, 1), lin("cable.break", W("s6", 11), W("s6", 11) + 15, 0, 1, "out"), lin("grids.k", W("s6", 13), W("s6", 17), 0, 1), mascot.point(W("s6", 14))[0]],
    badges: [
      { text: "NÃO EXISTE TOMADA DO PLANETA", variant: "negative", appearAt: W("s6", 10), disappearAt: W("s6", 13) },
      { text: "CADA REGIÃO, UMA REDE", variant: "info", appearAt: W("s6", 13) },
    ],
    highlights: ["rede elétrica só", "não existe", "cada região"],
    captions: [cap("s6", 5, "Pra isso, a Terra precisaria de uma rede elétrica só. Ela não existe. Cada região tem a sua.")],
    audioCues: [narration("s6"), sfx("hum", W("s6", 6), 0.3), sfx("spark", W("s6", 11), 0.45), sfx("shimmer", W("s6", 13), 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Numa rede, todos os geradores giram no mesmo ritmo. E as redes nem combinam: o Brasil usa sessenta hertz; o Paraguai, cinquenta.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit(GLOBE, 12.5, 40, 18)), key(W("s7", 2), P.southAmerica, "inOut"), key(end(6), orbit([-1.6, -0.6, 2.4], 6.0, -24, 10), "linear")] },
    objects: [
      { id: "globe", type: "NightGlobe(grids)", visible: true }, { id: "rotors", type: "MiniRotors(sobre o Brasil)", visible: true },
      { id: "waves", type: "Overlay(ondas 60 Hz azul × 50 Hz laranja)", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [set("grids.k", 0, 1), pop("rotors.sync", W("s7", 4)), pop("wave60", W("s7", 17)), pop("wave50", W("s7", 21))],
    badges: [
      { text: "TODOS NO MESMO RITMO", variant: "info", appearAt: W("s7", 5), disappearAt: W("s7", 17) },
      { text: "60 Hz × 50 Hz", subtitle: "Brasil × Paraguai", variant: "warning", appearAt: W("s7", 17) },
    ],
    highlights: ["mesmo ritmo", "Brasil", "sessenta hertz", "Paraguai", "cinquenta"],
    captions: [cap("s7", 6, "Numa rede, todos os geradores giram no mesmo ritmo. E as redes nem combinam: o Brasil usa sessenta hertz; o Paraguai, cinquenta.")],
    audioCues: [narration("s7"), sfx("whoosh-soft", 0, 0.3), sfx("hum", W("s7", 4), 0.25), sfx("ding", W("s7", 17), 0.3), sfx("ding", W("s7", 21), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Tanto que Itaipu, dos dois países, tem metade dos geradores em cada ritmo.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.itaipuStart), key(end(7), P.itaipuEnd, "inOut")] },
    objects: [
      { id: "itaipu", type: "ItaipuCutaway(20 rotores)", visible: true, state: { start: "rotores girando", end: "60 Hz rápidos × 50 Hz lentos" } },
      { id: "labels", type: "Labels3D(BRASIL 60 Hz / PARAGUAI 50 Hz)", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true },
    ],
    animations: [...fx.whipIn(), set("space.show", 0, 0), set("itaipu.show", 0, 1), lin("rotor60.angle", 0, end(7), 0, 6 * end(7) / FPS, "linear", "rad"), lin("rotor50.angle", 0, end(7), 0, 5 * end(7) / FPS, "linear", "rad"), pop("labels.pop", W("s8", 7))],
    badges: [
      { text: "ITAIPU: 10 + 10 GERADORES", variant: "info", appearAt: W("s8", 2), disappearAt: W("s8", 10) },
      { text: "2 RITMOS NA MESMA USINA", variant: "info", appearAt: W("s8", 10) },
    ],
    highlights: ["Itaipu", "dois países", "metade", "cada ritmo"],
    captions: [cap("s8", 7, "Tanto que Itaipu, dos dois países, tem metade dos geradores em cada ritmo.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.4), sfx("hum", 6, 0.3), sfx("pop", W("s8", 7), 0.3)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Apagão grande existe. Em agosto de 2023, uma linha caiu no Ceará, e a falha correu como dominó: vinte e cinco estados e o Distrito Federal no escuro.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.brazilWide), key(W("s9", 7), P.brazilCeara, "inOut"), key(W("s9", 15), P.brazilCeara), key(c(8, W("s9", 22)), P.brazilWide, "inOut"), key(end(8), orbit(add(BRAZIL, MAP.center), 13.5, 20, 52), "linear")] },
    objects: [
      { id: "brazil", type: "BrazilStatesMap(placas + luzinhas)", visible: true, state: { start: "todos acesos", end: "25 + DF apagados, Roraima acesa" } },
      { id: "line", type: "TransmissionLine(Ceará, torres)", visible: true }, { id: "counter", type: "Counter2D(0→26)", visible: true },
      { id: "seal", type: "Seal(ESQUEMA)", visible: true }, { id: "mascot", type: "Mascot(borda do pedestal)", visible: true },
    ],
    animations: [
      ...fx.whipIn(), set("itaipu.show", 0, 0), set("brazil.show", 0, 1), set("domino.t", 0, 0), set("lines.trace", 0, 0), set("gap.show", 0, 0), mascot.walk(0)[0],
      pop("line.spark", W("s9", 9)), ...fx.shake(W("s9", 9), 10), lin("domino.t", W("s9", 15), W("s9", 25), 0, 1, "in"),
      lin("counter", W("s9", 18), W("s9", 25), 0, 26, "linear", "count"), mascot.jump(W("s9", 17))[0],
    ],
    badges: [
      { text: "APAGÃO REAL: 15/08/2023", variant: "info", appearAt: W("s9", 3), disappearAt: W("s9", 18) },
      { text: "25 ESTADOS + DF NO ESCURO", variant: "negative", appearAt: W("s9", 18) },
    ],
    highlights: ["agosto de 2023", "Ceará", "dominó", "vinte e cinco estados"],
    captions: [cap("s9", 8, "Apagão grande existe. Em agosto de 2023, uma linha caiu no Ceará, e a falha correu como dominó: vinte e cinco estados e o Distrito Federal no escuro.")],
    audioCues: [narration("s9"), sfx("whoosh", 0, 0.4), sfx("spark", W("s9", 9), 0.5), sfx("domino", W("s9", 15), 0.4), sfx("power-down", W("s9", 24), 0.4)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "Só Roraima ficou com luz. Por quê? Ela não era ligada à rede nacional. A falha só corre até onde vão os fios.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, orbit(add(BRAZIL, MAP.center), 13.5, 20, 52)), key(W("s10", 2), P.brazilRoraima, "inOut"), key(W("s10", 13), P.brazilRoraima), key(c(9, W("s10", 16)), P.brazilLines, "inOut"), key(end(9), orbit(add(BRAZIL, MAP.center), 12.5, -6, 56), "linear")] },
    objects: [
      { id: "brazil", type: "BrazilStatesMap", visible: true }, { id: "thermal", type: "ThermalPlant(Roraima)", visible: true },
      { id: "gap", type: "GapDashed(Roraima × rede nacional)", visible: true }, { id: "lines", type: "TransmissionNetwork(luminosa)", visible: true },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [set("domino.t", 0, 1), pop("roraima.glow", W("s10", 1)), mascot.point(W("s10", 1))[0], pop("gap.show", W("s10", 10)), lin("lines.trace", W("s10", 14), W("s10", 21), 0, 1)],
    badges: [
      { text: "SÓ RORAIMA COM LUZ", variant: "positive", appearAt: W("s10", 1), disappearAt: W("s10", 10) },
      { text: "FORA DA REDE NACIONAL", variant: "info", appearAt: W("s10", 10), disappearAt: W("s10", 14) },
      { text: "A FALHA SÓ CORRE PELOS FIOS", variant: "info", size: "large", appearAt: W("s10", 14) },
    ],
    highlights: ["Roraima", "com luz", "rede nacional", "fios"],
    captions: [cap("s10", 9, "Só Roraima ficou com luz. Por quê? Ela não era ligada à rede nacional. A falha só corre até onde vão os fios.")],
    audioCues: [narration("s10"), sfx("glow", W("s10", 1), 0.4), sfx("tick", W("s10", 10), 0.3), sfx("shimmer", W("s10", 14), 0.35)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Então, algo derruba várias redes ao mesmo tempo? Tem um candidato: o Sol.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.globeFull), key(c(10, W("s11", 12)), P.sunAndEarth, "inOut"), key(end(10), orbit([-13, 1, -3], 25, -22, 10), "linear")] },
    objects: [
      { id: "globe", type: "NightGlobe(grids)", visible: true }, { id: "sun", type: "SunLowPoly", visible: true },
      { id: "field", type: "MagneticField(anéis)", visible: true, state: { start: "oculto", end: "visível" } }, { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [...fx.whipIn(), set("brazil.show", 0, 0), set("space.show", 0, 1), set("grids.k", 0, 1), lin("field.show", W("s11", 8), W("s11", 8) + 15, 0, 1), pop("sun.pulse", W("s11", 12)), mascot.float(0)[0]],
    badges: [
      { text: "VÁRIAS REDES DE UMA VEZ?", variant: "warning", icon: "?", appearAt: W("s11", 3), disappearAt: W("s11", 12) },
      { text: "O CANDIDATO: O SOL", variant: "warning", appearAt: W("s11", 12) },
    ],
    highlights: ["várias redes", "ao mesmo tempo", "candidato", "Sol"],
    captions: [cap("s11", 10, "Então, algo derruba várias redes ao mesmo tempo? Tem um candidato: o Sol.")],
    audioCues: [narration("s11"), sfx("whoosh", 0, 0.4), sfx("rumble-soft", W("s11", 8), 0.35), sfx("glow", W("s11", 12), 0.45)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "Em 1989, uma tempestade solar apagou Quebec, no Canadá, em menos de um minuto. Nove horas no escuro.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, orbit([-13, 1, -3], 25, -22, 10)), key(W("s12", 3), P.cmeMid, "inOut"), key(W("s12", 6), P.canada, "inOut"), key(end(11), orbit([-1.8, 2.2, 1.6], 5.5, -34, 22), "linear")] },
    objects: [
      { id: "sun", type: "SunLowPoly", visible: true }, { id: "cme", type: "CME(partículas)", visible: true, state: { start: "no Sol", end: "atinge a Terra" } },
      { id: "field", type: "MagneticField", visible: true }, { id: "globe", type: "NightGlobe(zoom Canadá)", visible: true },
      { id: "clock", type: "Clock2D(0→9 h)", visible: true },
    ],
    animations: [set("grids.k", 0, 0), lin("cme.t", W("s12", 2), W("s12", 5), 0, 1, "in"), pop("field.shake", W("s12", 5)), lin("quebec.lights", W("s12", 5), W("s12", 5) + 12, 1, 0), ...fx.flash(W("s12", 5)), lin("clock.hours", W("s12", 14), W("s12", 17), 0, 9, "inOut", "count")],
    badges: [
      { text: "QUEBEC, 1989", variant: "info", appearAt: W("s12", 1), disappearAt: W("s12", 9) },
      { text: "APAGOU EM MENOS DE 1 MINUTO", variant: "negative", appearAt: W("s12", 9), disappearAt: W("s12", 14) },
      { text: "9 HORAS NO ESCURO", variant: "negative", appearAt: W("s12", 14) },
    ],
    highlights: ["1989", "tempestade solar", "Quebec", "um minuto", "nove horas"],
    captions: [cap("s12", 11, "Em 1989, uma tempestade solar apagou Quebec, no Canadá, em menos de um minuto. Nove horas no escuro.")],
    audioCues: [narration("s12"), sfx("solar-whoosh", W("s12", 2), 0.5), sfx("power-down", W("s12", 5), 0.45), sfx("tick", W("s12", 14), 0.3)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "Só que tempestade solar não tem data marcada. A explosão é vista no Sol horas ou dias antes de chegar.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([-1.8, 2.2, 1.6], 5.5, -34, 22)), key(W("s13", 8), P.satellite, "inOut"), key(end(12), orbit([-12, 1.5, -2], 21, -10, 10), "linear")] },
    objects: [
      { id: "calendar", type: "Calendar2D(17/11 ✖)", visible: true }, { id: "satellite", type: "Satellite(genérico)", visible: true },
      { id: "sun", type: "SunLowPoly(flare)", visible: true }, { id: "warning", type: "WarningWave(satélite → Terra)", visible: true },
      { id: "globe", type: "NightGlobe", visible: true },
    ],
    animations: [set("quebec.lights", 0, 1), pop("calendar.cross", W("s13", 6)), pop("satellite.show", W("s13", 8)), lin("flare.t", W("s13", 9), W("s13", 11), 0, 1), lin("warning.wave", W("s13", 11), W("s13", 14), 0, 1), lin("cme.small", W("s13", 14), W("s13", 19), 0, 0.5, "linear")],
    badges: [
      { text: "SEM DATA MARCADA", variant: "negative", appearAt: W("s13", 6), disappearAt: W("s13", 14) },
      { text: "AVISO COM HORAS A DIAS", variant: "positive", appearAt: W("s13", 14) },
    ],
    highlights: ["data marcada", "explosão", "horas", "dias"],
    captions: [cap("s13", 12, "Só que tempestade solar não tem data marcada. A explosão é vista no Sol horas ou dias antes de chegar.")],
    audioCues: [narration("s13"), sfx("buzz", W("s13", 6), 0.3), sfx("pop", W("s13", 8), 0.3), sfx("ding", W("s13", 14), 0.35)],
  },
  {
    id: "s14", ...sc(13), voKey: "s14",
    narration: "Veredito: apagão no mundo inteiro, dia 17? Boato. Pronto: agora você sabe por que não existe um botão que desliga o planeta.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.globeFull), key(W("s14", 8), P.finalOrbit0, "inOut"), key(end(13), P.finalOrbit1, "inOut")] },
    objects: [
      { id: "globe", type: "NightGlobe", visible: true, state: { start: "redes coloridas", end: "luzes normais, aceso" } },
      { id: "verdict", type: "VerdictMeter2D(grande)", visible: true, state: { start: "centro", end: "BOATO (−80°), depois some" } },
      { id: "summary", type: "Overlay(3 ícones: redes separadas · falha para nos fios · Sol sem data)", visible: true },
      { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [
      lin("grids.k", 0, 20, undefined, 0), set("lights.on", 0, 1), pop("verdict.big", W("s14", 0)),
      { type: "spring", target: "verdict.needle", startFrame: W("s14", 7), endFrame: W("s14", 7) + 24, from: -35, to: -80, damping: 9, unit: "deg" },
      ...fx.shake(W("s14", 7), 12), ...fx.flash(W("s14", 7)), lin("verdict.big", W("s14", 9), W("s14", 9) + 10, 1, 0),
      pop("summary.icons", W("s14", 11)), mascot.cheer(W("s14", 8))[0], mascot.wave(W("s14", 18), 30)[0],
    ],
    badges: [
      { text: "VEREDITO: BOATO", variant: "negative", size: "large", appearAt: W("s14", 7), disappearAt: W("s14", 14) },
      { text: "NÃO EXISTE BOTÃO QUE DESLIGA O PLANETA", variant: "positive", appearAt: W("s14", 14) },
    ],
    highlights: ["veredito", "boato", "pronto", "botão", "planeta"],
    captions: [cap("s14", 13, "Veredito: apagão no mundo inteiro, dia 17? Boato. Pronto: agora você sabe por que não existe um botão que desliga o planeta.")],
    audioCues: [narration("s14"), sfx("tick", W("s14", 0), 0.3), sfx("thud", W("s14", 7), 0.55), sfx("final", W("s14", 8), 0.45)],
  },
];

/** Avalia um alvo "objeto.propriedade" no frame global (as trilhas são locais a cada cena). */
export const trackAt = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, fallback);
