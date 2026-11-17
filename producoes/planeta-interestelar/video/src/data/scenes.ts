// scenes.ts — Filme × Realidade #1: o planeta do Interestelar. Roteiro v1.1 e designs APROVADOS (17/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, CMB, GPS, GRID, planetPos, SEA, SPACE } from "./is";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-espaco", language: "pt-BR" };

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
const W = wordLocal;
type Pose = { position: Vec3; target: Vec3 };
const key = (at: number, pose: Pose, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const cut = (at: number, hold: Pose, next: Pose): CameraKey[] => [key(at - 1, hold), key(at, next)];
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");
const WORLDS = ["space", "grid", "gps", "sea", "cmb"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const PL = planetPos(6);
const P = {
  open: orbit(add(SPACE, [1.2, 0.4, 1.0]), 46, 28, 14),
  open2: orbit(add(SPACE, [2.6, 0.3, 2.4]), 22, 36, 10),
  pl: orbit(add(SPACE, PL), 5.2, 34, 8),
  pl2: orbit(add(SPACE, PL), 4.6, 26, 6),
  bh: orbit(add(SPACE, [0.6, 0, 0.6]), 30, 18, 12),
  bh2: orbit(add(SPACE, [0.6, 0, 0.6]), 40, 8, 16),
  grid: orbit(add(GRID, [2.2, -2.6, 0.6]), 27, 25, 40),
  grid2: orbit(add(GRID, [2.2, -2.8, 0.6]), 25, 15, 36),
  gps: orbit(add(GPS, [0.4, 0.9, 0.5]), 21, 25, 12),
  gps2: orbit(add(GPS, [0.4, 0.7, 0.4]), 23, 10, 10),
  orb: orbit(add(SPACE, [0.4, 0, 0.4]), 38, 20, 52),
  orb2: orbit(add(SPACE, [0.4, 0, 0.4]), 30, 30, 46),
  sea: orbit(add(SEA, [0, 4.0, -12]), 30, 0, -4),
  sea2: orbit(add(SEA, [0, 5.0, -12]), 36, 4, -3),
  cmb: orbit(add(CMB, [0, 0, 0]), 15, 15, 8),
  cmb2: orbit(add(CMB, [0, 0, 0]), 11.5, 30, 10),
  fin: orbit(add(SPACE, [1.4, 0.2, 1.2]), 30, 40, 20),
  fin2: orbit(add(SPACE, [1.4, 0.2, 1.2]), 36, 60, 24),
};

const ZERO = ["series.card", "split", "years", "ticks.k", "grid.depth", "clocks.k", "gps.glow", "phone", "drift", "gauge", "orbit.k", "wave.k", "inset", "cmb.k", "thermo", "verdict", "needle", "seal.k", "sealI.k", "mascot.float", "ls"];
const sealOnly = (at: number, which: "seal.k" | "sealI.k" | "none"): TrackAnimation[] => [set("seal.k", at, which === "seal.k" ? 1 : 0), set("sealI.k", at, which === "sealI.k" ? 1 : 0)];
const M_PL = add(SPACE, add(PL, [-0.9, 0.55, 0.9]));

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Filme ou realidade? Em Interestelar, uma hora num planeta vale sete anos na Terra. Isso é possível?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.open), key(W("s1", 5), P.open, "linear"), key(end(0), P.open2, "inOut")] },
    objects: [{ id: "space", type: "BlackHole + OceanPlanet", visible: true }, { id: "series", type: "SeriesCard FILME × REALIDADE #1", visible: true }, { id: "split", type: "Clock2D × YearsCard", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "space"), ...ZERO.map((t) => set(t, 0, 0)), set("orbit.r", 0, 6), set("bh.spin", 0, 0.35),
      lin("series.card", W("s1", 0), W("s1", 0) + 10, 0, 1, "out"), popOut("series.card", W("s1", 3) - 2, 8),
      pop("split", W("s1", 5)), lin("years", W("s1", 10), W("s1", 13) + 6, 0, 7, "out", "count"), popOut("split", end(0) - 6, 6), ...fx.punch(W("s1", 16)),
      ...mascot.place(M_PL, 0.6, 0.32, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 0) + 6, 40), ...mascot.jump(W("s1", 13)),
    ],
    badges: [{ text: "1 HORA = 7 ANOS?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 14) }],
    highlights: ["FILME", "REALIDADE", "INTERESTELAR", "UMA", "HORA", "SETE", "ANOS", "TERRA", "POSSÍVEL"],
    captions: [cap("s1", 0, "Filme ou realidade? Em Interestelar, uma hora num planeta vale sete anos na Terra. Isso é possível?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("badge", W("s1", 0), 0.35), sfx("pop", W("s1", 5), 0.3), sfx("hourglass", W("s1", 10), 0.25), sfx("alert-tone", W("s1", 14), 0.2)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Escuta esse tic-tac: a cada tic, passa quase um dia inteiro na Terra.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.pl), key(end(1), P.pl2, "linear")] },
    objects: [{ id: "space", type: "Planeta de perto", visible: true }, { id: "clock", type: "Clock2D + DayCounter (1 tic = 1 dia)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "space"), ...mascot.hide(0, 4), lin("ticks.k", 0, 10, 0, 1, "out"), popOut("ticks.k", end(1) - 6, 6), ...fx.shake(W("s2", 9), 12)],
    badges: [{ text: "CADA TIC ≈ 1 DIA NA TERRA", variant: "info", appearAt: W("s2", 3) }],
    highlights: ["TIC-TAC", "TIC", "DIA", "INTEIRO", "TERRA"],
    captions: [cap("s2", 1, "Escuta esse tic-tac: a cada tic, passa quase um dia inteiro na Terra.")],
    audioCues: [narration("s2"), sfx("whoosh-soft", 0, 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "O segredo é Gargântua, um buraco negro gigante. Perto de uma gravidade enorme, o tempo passa mais devagar.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.bh), ...cut(W("s3", 8), P.bh2, P.grid), key(end(2), P.grid2, "linear")] },
    objects: [{ id: "space", type: "BlackHole inteiro", visible: true }, { id: "grid", type: "SpacetimeGrid + relógios", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "space"), ...sealOnly(0, "none"), ...mascot.place(M_PL, 0.9, 0.5, 0), ...mascot.float(0, true, 1), ...mascot.point(W("s3", 3), 40, 1.6),
      whipMid(W("s3", 8)), ...world(W("s3", 8), "grid"), ...mascot.hide(W("s3", 8), 1), ...sealOnly(W("s3", 8), "seal.k"), set("grid.t0", W("s3", 8), 0),
      lin("grid.depth", W("s3", 11), W("s3", 12) + 12, 0, 1, "inOut"), pop("clocks.k", W("s3", 13)),
    ],
    badges: [
      { text: "GARGÂNTUA", variant: "info", subtitle: "BURACO NEGRO SUPERMASSIVO", appearAt: W("s3", 3), disappearAt: W("s3", 8) },
      { text: "PERTO = TEMPO MAIS LENTO", variant: "warning", appearAt: W("s3", 14) },
    ],
    highlights: ["SEGREDO", "GARGÂNTUA", "BURACO", "NEGRO", "GIGANTE", "GRAVIDADE", "ENORME", "TEMPO", "DEVAGAR"],
    captions: [cap("s3", 2, "O segredo é Gargântua, um buraco negro gigante. Perto de uma gravidade enorme, o tempo passa mais devagar.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.3), sfx("rumble-soft", W("s3", 5), 0.3), sfx("whoosh-soft", W("s3", 8), 0.3), sfx("warp", W("s3", 11), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Parece ficção, mas é Einstein. Os relógios dos satélites de GPS são corrigidos por causa disso, senão o mapa errava quilômetros por dia.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.gps), key(end(3), P.gps2, "inOut")] },
    objects: [{ id: "gps", type: "Earth + GpsSat", visible: true }, { id: "phone", type: "PhoneMap (pino escorrega)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "gps"), ...sealOnly(0, "none"),
      lin("gps.glow", W("s4", 12), W("s4", 12) + 6, 0, 1, "out"), lin("gps.glow", W("s4", 12) + 20, W("s4", 12) + 30, 1, 0.3, "in"),
      pop("phone", W("s4", 16)), lin("drift", W("s4", 18), W("s4", 22), 0, 1, "inOut"), ...fx.shake(W("s4", 20), 14),
    ],
    badges: [
      { text: "EINSTEIN", variant: "info", subtitle: "A GRAVIDADE MUDA O RITMO DO TEMPO", appearAt: W("s4", 4), disappearAt: W("s4", 10) },
      { text: "GPS: ~38 MICROSSEGUNDOS/DIA", variant: "info", appearAt: W("s4", 10), disappearAt: W("s4", 16) },
      { text: "SEM CORREÇÃO: ~10 KM/DIA", variant: "negative", appearAt: W("s4", 19) },
    ],
    highlights: ["FICÇÃO", "EINSTEIN", "RELÓGIOS", "SATÉLITES", "GPS", "CORRIGIDOS", "MAPA", "ERRAVA", "QUILÔMETROS"],
    captions: [cap("s4", 3, "Parece ficção, mas é Einstein. Os relógios dos satélites de GPS são corrigidos por causa disso, senão o mapa errava quilômetros por dia.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.35), sfx("ding", W("s4", 4), 0.25), sfx("spark", W("s4", 12), 0.3), sfx("pop", W("s4", 16), 0.3), sfx("buzz", W("s4", 19), 0.3)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Só que, pra chegar a sete anos por hora, o buraco negro teria que girar quase no limite, e o planeta, orbitar colado nele.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.orb), key(end(4), P.orb2, "inOut")] },
    objects: [{ id: "space", type: "BlackHole girando + órbita encolhendo", visible: true }, { id: "gauge", type: "SpinGauge", visible: true }, { id: "ls", type: "LikeSubscribe (lento)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "space"), ...mascot.hide(0, 1), set("orbit.r", 0, 6), set("bh.spin", 0, 0.35), lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      lin("orbit.k", 4, 30, 0, 1, "inOut"), pop("gauge", W("s5", 10)), lin("bh.spin", W("s5", 14), W("s5", 17) + 10, 0.35, 1.3, "in"), lin("gauge.v", W("s5", 14), W("s5", 17) + 10, 0.3, 1, "out"),
      popOut("gauge", W("s5", 20), 8), lin("orbit.r", W("s5", 20), W("s5", 23) + 12, 6, 2.9, "inOut"), ...fx.punch(W("s5", 22)),
    ],
    badges: [
      { text: "GIRANDO QUASE NO MÁXIMO", variant: "warning", appearAt: W("s5", 14), disappearAt: W("s5", 20) },
      { text: "ÓRBITA COLADA NO HORIZONTE", variant: "warning", appearAt: W("s5", 21) },
    ],
    highlights: ["SETE", "ANOS", "HORA", "GIRAR", "LIMITE", "ORBITAR", "COLADO"],
    captions: [cap("s5", 4, "Só que, pra chegar a sete anos por hora, o buraco negro teria que girar quase no limite, e o planeta, orbitar colado nele.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.3), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("warp", W("s5", 14), 0.35), sfx("solar-whoosh", W("s5", 20), 0.35)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "E as ondas gigantes? A gravidade do buraco negro puxa o oceano, o planeta balança, e surgem ondas do tamanho de montanhas.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.sea), key(W("s6", 15), P.sea, "linear"), key(end(5), P.sea2, "inOut")] },
    objects: [{ id: "sea", type: "OceanSurface + GiantWave + BH no céu", visible: true }, { id: "inset", type: "Inset 2D: maré + planeta balançando", visible: true }, { id: "mascot", type: "Mascot na água", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "sea"), ...sealOnly(0, "none"), set("wave.k", 0, 0.18),
      pop("inset", W("s6", 4)), popOut("inset", W("s6", 15), 8),
      lin("wave.k", W("s6", 15), W("s6", 21) + 8, 0.18, 1, "inOut"), ...fx.shake(W("s6", 21), 22),
      ...mascot.place(add(SEA, [0.9, -0.04, -1]), 2.9, 0.55, 0), ...mascot.float(0, false, 1), ...mascot.look(W("s6", 2), 0.4), ...mascot.jump(W("s6", 17)), ...mascot.jump(W("s6", 21)),
    ],
    badges: [
      { text: "MARÉ DO BURACO NEGRO", variant: "info", subtitle: "+ O PLANETA BALANÇANDO", appearAt: W("s6", 4), disappearAt: W("s6", 15) },
      { text: "ONDAS DO TAMANHO DE MONTANHAS", variant: "warning", appearAt: W("s6", 17) },
    ],
    highlights: ["ONDAS", "GIGANTES", "GRAVIDADE", "PUXA", "OCEANO", "BALANÇA", "MONTANHAS"],
    captions: [cap("s6", 5, "E as ondas gigantes? A gravidade do buraco negro puxa o oceano, o planeta balança, e surgem ondas do tamanho de montanhas.")],
    audioCues: [narration("s6"), sfx("dive", 0, 0.3), sfx("ocean-amb", 0, 0.25), sfx("rumble", W("s6", 15), 0.35), sfx("gush", W("s6", 18), 0.35), sfx("thud", W("s6", 21), 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Sem sol, o calor viria do brilho que sobrou do Big Bang, esquentado perto do buraco negro. Um estudo de 2020 fez essa conta.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.cmb), key(end(6), P.cmb2, "inOut")] },
    objects: [{ id: "cmb", type: "OceanPlanet + CmbParticles", visible: true }, { id: "thermo", type: "Thermo2D", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "cmb"), ...sealOnly(0, "sealI.k"), ...mascot.hide(0, 1), lin("cmb.k", W("s7", 6), W("s7", 6) + 8, 0, 1, "out"), set("cmb.t0", W("s7", 6), 0),
      pop("thermo", W("s7", 12)), lin("thermo.v", W("s7", 12), W("s7", 16) + 10, 0, 0.72, "inOut"),
    ],
    badges: [
      { text: "SEM SOL?", variant: "warning", icon: "?", appearAt: W("s7", 0), disappearAt: W("s7", 6) },
      { text: "BRILHO DO BIG BANG", variant: "info", subtitle: "RADIAÇÃO CÓSMICA DE FUNDO", appearAt: W("s7", 6), disappearAt: W("s7", 17) },
      { text: "ESTUDO DE 2020 · HIPÓTESE", variant: "info", appearAt: W("s7", 17) },
    ],
    highlights: ["SOL", "CALOR", "BRILHO", "BIG", "BANG", "ESQUENTADO", "ESTUDO", "2020", "CONTA"],
    captions: [cap("s7", 6, "Sem sol, o calor viria do brilho que sobrou do Big Bang, esquentado perto do buraco negro. Um estudo de 2020 fez essa conta.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.3), sfx("shimmer", W("s7", 6), 0.3), sfx("glow", W("s7", 12), 0.3), sfx("ding", W("s7", 17), 0.25)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Veredito: funciona, com asterisco. A física permite, mas nunca acharam um planeta assim. Pronto: agora você sabe o que vale cada tic.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "space", type: "BlackHole + planeta + mascote", visible: true }, { id: "verdict", type: "VerdictMeter (NÃO FUNCIONA ↔ FUNCIONA)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "space"), ...sealOnly(0, "none"), set("orbit.r", 0, 2.9), set("orbit.k", 0, 0), set("bh.spin", 0, 0.6),
      pop("verdict", W("s8", 0)), lin("needle", W("s8", 0), W("s8", 1) + 14, -90, 58, "out", "deg"), ...fx.flash(W("s8", 1) + 4, 8),
      popOut("verdict", end(7) - s(5.2), 8),
      ...mascot.place(add(SPACE, add(planetPos(2.9), [-0.8, 0.9, 1.2])), 0.6, 0.38, 0), ...mascot.float(0, true, 1), ...mascot.cheer(W("s8", 1) + 4, 40), ...mascot.wave(W("s8", 14), 40),
      ...fx.punch(W("s8", 21)),
    ],
    badges: [
      { text: "VEREDITO: FUNCIONA*", variant: "positive", size: "large", appearAt: W("s8", 1), disappearAt: end(7) - s(5.2) },
      { text: "*FÍSICA PERMITE · NUNCA ACHARAM", variant: "warning", appearAt: W("s8", 4), disappearAt: end(7) - s(5.2) },
    ],
    highlights: ["VEREDITO", "FUNCIONA", "ASTERISCO", "FÍSICA", "PERMITE", "NUNCA", "PRONTO", "TIC"],
    captions: [cap("s8", 7, "Veredito: funciona, com asterisco. A física permite, mas nunca acharam um planeta assim. Pronto: agora você sabe o que vale cada tic.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.3), sfx("final", W("s8", 1), 0.4), sfx("tick", W("s8", 21), 0.6)],
  },
];

export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);
export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const sceneIndexAt = (frame: number) => scenes.indexOf(sceneAt(frame));
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
