import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { hookTracks, likeSubscribeSfx, likeSubscribeTracks } from "../opening";

// Contrato de dados do vídeo (o scene-plan.ts da Fase 1 vira este arquivo na Fase 2).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// Os cortes vêm de utils/timing.ts (planejados antes do TTS, medidos depois).

export type VideoConfig = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  theme: string;
  language: string;
};

export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "low-poly-3d", language: "pt-BR" };

/** negative = problema (✖ vermelho), positive = solução (✔ verde), info = termo/neutro, warning = pergunta/atenção. */
export type BadgeVariant = "positive" | "negative" | "info" | "warning";

/** Pose de passagem da câmera (a câmera interpola em coordenadas orbitais entre as chaves). */
export type CameraKey = { at: number; position: Vec3; target: Vec3; zoom?: number; easing?: EaseName };

export type CameraPlan = {
  projection: "perspective" | "orthographic";
  movement: "dolly-in" | "dolly-out" | "vertical" | "orbit" | "tracking" | "split" | "hold";
  /** keys[0] é a pose inicial do plano; inclua uma chave no último frame para continuidade. */
  keys: CameraKey[];
};

/** Objeto persistente do sistema: ids estáveis entre cenas; `visible` controla a montagem. */
export type SceneObject = { id: string; type: string; visible: boolean; state?: { start: string; end: string } };

export type SceneBadge = {
  text: string;
  variant: BadgeVariant;
  appearAt: number;
  disappearAt?: number;
  subtitle?: string;
  /** Coluna central (padrão) ou metade esquerda/direita de uma tela dividida. */
  slot?: "center" | "left" | "right";
  icon?: "?";
  size?: "normal" | "large";
};

/** Legenda provisória (antes do TTS). Depois do alinhamento, as legendas vêm palavra a palavra de vo.json. */
export type CaptionBlock = { text: string; from: number; to: number };

export type AudioCue = {
  kind: "narration" | "sfx";
  /** Caminho em public/ (ex.: "audio/vo/s1.wav", "audio/sfx/whoosh.wav"). */
  src: string;
  at: number;
  volume: number;
  /** "planned" ainda não existe em disco e não é tocado; "ready" foi gerado/medido. */
  status: "planned" | "ready";
};

export type ScenePlan = {
  id: string;
  startFrame: number;
  durationInFrames: number;
  voKey: VoKey;
  narration: string;
  camera: CameraPlan;
  objects: SceneObject[];
  animations: TrackAnimation[];
  badges: SceneBadge[];
  /** Palavras-chave (MAIÚSCULAS, sem pontuação) coloridas na legenda. */
  highlights: string[];
  captions: CaptionBlock[];
  audioCues: AudioCue[];
};

const sc = (i: number) => ({ startFrame: SCENE_FRAMES[i].from, durationInFrames: SCENE_FRAMES[i].durationInFrames });
const end = (i: number) => SCENE_FRAMES[i].durationInFrames;
const W = wordLocal;
type Pose = { position: Vec3; target: Vec3 };
const key = (at: number, pose: Pose, easing?: EaseName, zoom?: number): CameraKey => ({ at, ...pose, easing, zoom });
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const popIn = (target: string, at: number, len = 10): TrackAnimation => lin(target, at, at + len, 0, 1, "out");
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");
const nave = (at: number): TrackAnimation[] => [set("set.nave", at, 1), set("set.maq", at, 0)];
const maq = (at: number): TrackAnimation[] => [set("set.nave", at, 0), set("set.maq", at, 1)];
const MASCOT: Vec3 = [-2.7, -0.9, 2.3];

// câmeras (9:16; zoom < 1 abre o campo de visão para a maquete)
const P = {
  naveA: orbit([-0.6, -0.3, 0], 15, 160, 14),
  naveB: orbit([-0.6, -0.4, 0], 13, 145, 10),
  earth: orbit([-26, 7, -48], 10, 200, 6),
  front: orbit([-1.0, -0.4, 0.4], 14, 30, 8),
  rec: orbit([0.0, 2.25, 1.3], 3.3, 15, 6),
  rec2: orbit([0.0, 2.3, 1.3], 2.9, -10, 4),
  rtg: orbit([-2.0, -0.1, -0.15], 6, 205, 18),
  rtg2: orbit([-1.6, -0.1, -0.15], 7, 190, 12),
  away: orbit([0, 0, -10], 28, 175, 6),
  maqA: orbit([8, 0, 5], 40, -25, 38),
  maqB: orbit([15, 0.5, 6], 58, -12, 30),
  maqC: orbit([2, 0, 3], 92, -28, 26),
  maqD: orbit([6, 0, 4], 80, -40, 22),
};
const ZERO = ["pulse1", "trail", "beam", "ruler", "helio.show", "helio.glow", "rec", "drift", "clock.v", "clock.h", "speed.v", "speed", "dist.v", "greet", "greet.v", "energy.v", "esq.v", "ls"];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Se você mandar um oi pra essa nave agora, ele só chega amanhã. E a resposta, só depois de amanhã.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.naveA, "inOut", 0.55), key(W("s1", 4) - 1, P.naveB, "inOut", 0.55), key(W("s1", 4), P.earth, "inOut", 0.55), key(W("s1", 9) - 1, orbit([-20, 6, -40], 15, 205, 6), "inOut", 0.55), key(W("s1", 9), P.naveB, "inOut", 0.55), key(end(0), P.front, "inOut", 0.55)] },
    objects: [{ id: "nave", type: "Voyager + Terra distante + pulso", visible: true }],
    animations: [
      ...nave(0), ...ZERO.map((t) => set(t, 0, 0)), set("rtg", 0, 0.7), set("lights", 0, 6), set("mag", 0, 0.42), set("whips", 0, 0.45),
      ...hookTracks(W("s1", 8)),
      lin("pulse1", W("s1", 4), W("s1", 15), 0, 1, "linear"),
      popIn("clock.v", W("s1", 9)), lin("clock.h", W("s1", 9), W("s1", 12) + 6, 0, 24, "inOut", "count"), lin("clock.h", W("s1", 15), W("s1", 19) + 8, 24, 48, "inOut", "count"), popOut("clock.v", end(0) - 8),
      ...mascot.place(MASCOT, 0.5, 0.9, 0), ...mascot.float(0, true, 1), ...mascot.face(W("s1", 11), "surprise", s(1.4)),
    ],
    badges: [],
    highlights: ["OI", "AMANHÃ", "RESPOSTA"],
    captions: [cap("s1", 0, "Se você mandar um oi pra essa nave agora, ele só chega amanhã. E a resposta, só depois de amanhã.")],
    audioCues: [narration("s1"), sfx("deep-amb", 0, 0.25), sfx("glow", W("s1", 4), 0.3), sfx("tick", W("s1", 12), 0.35), sfx("tick", W("s1", 19), 0.35)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Essa é a Voyager 1. Ela saiu da Terra em 1977 e viaja a sessenta e um mil quilômetros por hora, sem parar, há quase cinquenta anos.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.front, "inOut", 0.55), key(W("s2", 5) - 1, orbit([-0.8, -0.3, 0.2], 12, 70, 12), "inOut", 0.55), key(W("s2", 5), P.maqA, "inOut", 0.5), key(end(1), orbit([10, 0, 6], 36, -5, 32), "inOut", 0.5)] },
    objects: [{ id: "nave", type: "Voyager → maquete com trajetória", visible: true }],
    animations: [
      ...nave(0), ...maq(W("s2", 5)), set("esq.v", W("s2", 5), 1),
      lin("trail", W("s2", 6), end(1), 0, 0.42, "inOut"),
      ...fx.punch(W("s2", 10)),
      popIn("speed.v", W("s2", 13)), lin("speed", W("s2", 13), W("s2", 18), 0, 61000, "out", "count"), popOut("speed.v", end(1) - 8),
      ...mascot.wave(W("s2", 2), s(1.2)), ...mascot.hide(W("s2", 5) - 2, 2),
    ],
    badges: [{ text: "LANÇADA EM 1977", variant: "info", appearAt: W("s2", 10), disappearAt: end(1) - 4 }],
    highlights: ["VOYAGER", "1977"],
    captions: [cap("s2", 1, "Essa é a Voyager 1. Ela saiu da Terra em 1977 e viaja a 61 mil km por hora, sem parar, há quase 50 anos.")],
    audioCues: [narration("s2"), sfx("whoosh", W("s2", 5), 0.3), sfx("warp", W("s2", 7), 0.25), sfx("badge", W("s2", 10), 0.28), sfx("tick", W("s2", 14), 0.25)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "No dia 18 de novembro, ela chegou a um dia-luz da Terra: a distância que a luz percorre em vinte e quatro horas. Quase vinte e seis bilhões de quilômetros.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([10, 0, 6], 36, -5, 32), "inOut", 0.5), key(end(2), P.maqB, "inOut", 0.5)] },
    objects: [{ id: "maq", type: "maquete + régua + raio de luz", visible: true }],
    animations: [
      ...maq(0), set("esq.v", 0, 1),
      lin("trail", 0, W("s3", 8), 0.42, 1, "inOut"),
      popIn("ruler", W("s3", 9), 12),
      ...fx.punch(W("s3", 9)),
      lin("beam", W("s3", 12), W("s3", 22) + 6, 0, 1, "linear"),
      popIn("clock.v", W("s3", 12)), lin("clock.h", W("s3", 12), W("s3", 22) + 6, 0, 24, "linear", "count"), popOut("clock.v", W("s3", 23) + 6),
      popIn("dist.v", W("s3", 23)), popOut("dist.v", end(2) - 6),
    ],
    badges: [{ text: "1 DIA-LUZ", variant: "info", appearAt: W("s3", 9), disappearAt: end(2) - 4 }],
    highlights: ["DIA-LUZ", "24", "HORAS", "BILHÕES"],
    captions: [cap("s3", 2, "No dia 18 de novembro, ela chegou a um dia-luz da Terra: a distância que a luz percorre em 24 horas. Quase 26 bilhões de km.")],
    audioCues: [narration("s3"), sfx("shimmer", W("s3", 9), 0.3), sfx("glow", W("s3", 12), 0.3), sfx("badge", W("s3", 9), 0.25), sfx("ding", W("s3", 23), 0.25)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Nada feito por humanos foi tão longe. Desde 2012, ela já saiu da bolha do Sol e viaja no espaço entre as estrelas.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.maqB, "inOut", 0.5), key(W("s4", 7), P.maqC, "inOut", 0.5), key(end(3), P.maqD, "inOut", 0.5)] },
    objects: [{ id: "maq", type: "maquete + bolha do Sol", visible: true }],
    animations: [
      ...maq(0), set("esq.v", 0, 1), set("trail", 0, 1), lin("ruler", 0, 10, undefined, 0, "in"),
      lin("helio.show", W("s4", 7), W("s4", 13), 0, 1, "out"),
      lin("helio.glow", W("s4", 13), W("s4", 15), 0, 1, "out"), lin("helio.glow", W("s4", 15) + 10, end(3), 1, 0.3, "inOut"),
      ...fx.punch(W("s4", 5)),
    ],
    badges: [
      { text: "RECORDE HUMANO", variant: "positive", appearAt: W("s4", 5), disappearAt: W("s4", 7) + 20 },
      { text: "FORA DA BOLHA DO SOL · 2012", variant: "info", appearAt: W("s4", 8), disappearAt: end(3) - 4 },
    ],
    highlights: ["LONGE", "2012", "BOLHA", "SOL", "ESTRELAS"],
    captions: [cap("s4", 3, "Nada feito por humanos foi tão longe. Desde 2012, ela já saiu da bolha do Sol e viaja no espaço entre as estrelas.")],
    audioCues: [narration("s4"), sfx("final", W("s4", 5), 0.25), sfx("solar-whoosh", W("s4", 7), 0.3), sfx("shimmer", W("s4", 13), 0.25)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "E leva um disco de ouro, com sons da Terra e saudações em cinquenta e cinco línguas. A de português diz: paz e felicidade a todos.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([-0.6, 0.6, 0.6], 13, 30, 14), "inOut", 0.55), key(W("s5", 3), orbit([0, 2.0, 1.0], 4.5, 20, 8), "inOut", 0.8), key(W("s5", 8), P.rec), key(end(4), P.rec2, "inOut")] },
    objects: [{ id: "nave", type: "Voyager + disco de ouro", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...nave(0), set("esq.v", 0, 0), set("ruler", 0, 0), set("helio.show", 0, 0), set("mag", 0, 0.42), set("whips", 0, 0.45), set("mag", W("s5", 3), 0), set("whips", W("s5", 3), 0),
      { type: "spring", target: "rec", startFrame: W("s5", 3), endFrame: W("s5", 3) + 30, from: 0, to: 1, damping: 14, unit: "0-1" },
      ...likeSubscribeTracks(s(0.3)),
      popIn("greet.v", W("s5", 19)), lin("greet", W("s5", 21), W("s5", 25) + 8, 0, 5, "linear", "count"), popOut("greet.v", end(4) - 6),
      ...fx.punch(W("s5", 21)),
      ...mascot.place(MASCOT, 0.5, 0.9, 0), ...mascot.face(W("s5", 20), "happy", s(2.2)),
    ],
    badges: [{ text: "DISCO DE OURO · 55 LÍNGUAS", variant: "info", appearAt: W("s5", 3), disappearAt: end(4) - 4 }],
    highlights: ["OURO", "55", "PORTUGUÊS", "PAZ", "FELICIDADE"],
    captions: [cap("s5", 4, "E leva um disco de ouro, com sons da Terra e saudações em 55 línguas. A de português diz: paz e felicidade a todos.")],
    audioCues: [narration("s5"), sfx("shimmer", W("s5", 3), 0.35), sfx("badge", W("s5", 3), 0.25), ...likeSubscribeSfx(s(0.3)).map((c) => sfx(c.name, c.at, c.volume)), sfx("ding", W("s5", 21), 0.25)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Só que a energia dela vem de plutônio, e enfraquece todo ano. A NASA já desligou vários instrumentos pra ela durar até a próxima década.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.rtg, "inOut", 0.8), key(W("s6", 12), P.rtg2, "inOut", 0.8), key(W("s6", 13), orbit([0.3, -0.3, -0.3], 4.6, 160, 10), "inOut", 0.8), key(end(5), orbit([0.3, -0.35, -0.3], 4.0, 175, 8), "inOut", 0.8)] },
    objects: [{ id: "nave", type: "Voyager: geradores e luzes", visible: true }],
    animations: [
      ...nave(0), set("rec", 0, 0), set("mag", 0, 0), set("whips", 0, 0.45),
      popIn("energy.v", W("s6", 3)), lin("rtg", W("s6", 7), W("s6", 11) + 10, 0.7, 0.25, "inOut"), popOut("energy.v", W("s6", 13)),
      lin("lights", W("s6", 15), W("s6", 17) + 24, 6, 2, "linear", "count"),
      ...fx.desaturate(W("s6", 9), end(5), 0.3),
      ...mascot.face(W("s6", 3), "sad", s(3.2)),
    ],
    badges: [
      { text: "ENERGIA CAINDO", variant: "negative", appearAt: W("s6", 3), disappearAt: W("s6", 12) },
      { text: "INSTRUMENTOS DESLIGADOS", variant: "warning", appearAt: W("s6", 15), disappearAt: end(5) - 4 },
    ],
    highlights: ["PLUTÔNIO", "ENFRAQUECE", "NASA", "DESLIGOU"],
    captions: [cap("s6", 5, "Só que a energia dela vem de plutônio, e enfraquece todo ano. A NASA já desligou vários instrumentos pra ela durar até a próxima década.")],
    audioCues: [narration("s6"), sfx("hum", 0, 0.2), sfx("power-down", W("s6", 9), 0.25), sfx("click", W("s6", 15), 0.35), sfx("click", W("s6", 16) + 6, 0.35), sfx("click", W("s6", 17) + 12, 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Um dia ela vai ficar muda. Mas o disco foi feito pra durar mais de um bilhão de anos. Pronto: agora você sabe onde está o objeto humano mais distante.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, orbit([-0.6, -0.3, 0], 14, 150, 8), "inOut", 0.55), key(W("s7", 6), orbit([0, 0, -6], 20, 165, 6), "inOut", 0.55), key(end(6), P.away, "inOut", 0.55)] },
    objects: [{ id: "nave", type: "Voyager se afastando", visible: true }],
    animations: [
      ...nave(0), lin("lights", 0, 20, undefined, 1, "linear", "count"), set("rtg", 0, 0.2), set("mag", 0, 0.42),
      lin("drift", W("s7", 6), end(6), 0, 0.45, "inOut"),
      { type: "spring", target: "rec", startFrame: W("s7", 8), endFrame: W("s7", 8) + 30, from: 0, to: 0.35, damping: 14, unit: "0-1" },
      ...mascot.wave(W("s7", 19), s(1.6)),
    ],
    badges: [{ text: "DISCO: +1 BILHÃO DE ANOS", variant: "positive", appearAt: W("s7", 16), disappearAt: end(6) - 4 }],
    highlights: ["MUDA", "BILHÃO", "PRONTO", "DISTANTE"],
    captions: [cap("s7", 6, "Um dia ela vai ficar muda. Mas o disco foi feito pra durar mais de um bilhão de anos. Pronto: agora você sabe onde está o objeto humano mais distante.")],
    audioCues: [narration("s7"), sfx("deep-amb", 0, 0.25), sfx("shimmer", W("s7", 16), 0.3), sfx("whoosh-soft", W("s7", 6), 0.25)],
  },
];

/** Valor de uma trilha de animação (ex.: "subject.scale") no frame global. */
export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);

/** Cena ativa no frame global. */
export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (frame >= scenes[i].startFrame) return scenes[i];
  }
  return scenes[0];
};

export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

// Verificação de integridade da timeline (executada ao importar): contígua, começa em 0, soma DURATION.
scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) {
    throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
  }
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) {
  throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
}
