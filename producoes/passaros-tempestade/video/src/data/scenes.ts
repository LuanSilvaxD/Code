// scenes.ts — "O único anfíbio que vivia no MAR" (Gerrothorax maritimus). Roteiro v1 e designs APROVADOS (14/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, BONE, LAB, MAP, POND, SEA, SKIN } from "./amph";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-oceano", language: "pt-BR" };

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
const WORLDS = ["pond", "skin", "lab", "sea", "map", "bone"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const P = {
  pond: orbit(add(POND, [-0.3, -0.1, 0]), 6.2, -12, 24),
  pond2: orbit(add(POND, [0.0, -0.1, 0]), 5.6, 6, 26),
  sea: orbit(add(POND, [2.6, -0.2, 0]), 6.5, 30, 24),
  floorSil: orbit(add(SEA, [0, 0.1, 0]), 4.8, 25, 30),
  floorSil2: orbit(add(SEA, [0, 0.1, 0]), 4.2, 45, 26),
  skin: orbit(add(SKIN, [0.9, -0.4, 0]), 15, 18, 22),
  skin2: orbit(add(SKIN, [0.9, -0.4, 0]), 14, 30, 26),
  lab: orbit(add(LAB, [0, -0.5, 0.1]), 13, 0, 58),
  lab2: orbit(add(LAB, [-0.4, -0.25, 0.2]), 5.6, 15, 40),
  lab3: orbit(add(LAB, [-0.45, -0.15, 0.2]), 4.8, 30, 34),
  hero: orbit(add(SEA, [0.05, -0.1, 0]), 3.4, 35, 26),
  hero2: orbit(add(SEA, [0.05, -0.1, 0]), 3.2, 70, 22),
  drift: orbit(add(SEA, [0, 0.2, 0]), 16, 0, 10),
  map: orbit(add(MAP, [-1.5, -3, 0]), 50, 0, 62),
  map2: orbit(add(MAP, [-1, -3, 0]), 47, 10, 56),
  bone: orbit(add(BONE, [0, 0, 1.4]), 16, 0, 82),
  bone2: orbit(add(BONE, [0, 0, 1.4]), 15, 15, 78),
  bury: orbit(add(SEA, [0.15, -0.15, 0]), 3.8, -30, 30),
  bury2: orbit(add(SEA, [0.3, -0.1, 0]), 3.3, -10, 26),
  fin: orbit(add(SEA, [0.3, -0.1, 0]), 5.5, 20, 22),
  fin2: orbit(add(SEA, [0.3, 0.3, 0]), 11, 40, 18),
};

const ZERO = ["count", "seaX", "sil", "skin.in", "skin.out", "salt", "shrink", "seal.k", "sealI.k", "fossil.k", "ruler.k", "armor.k", "drift.t", "q.k", "coast.k", "ichthy.t", "sr.glow", "match.k", "shield.k", "bury", "prey.t", "mascot.float"];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Dos mais de oito mil anfíbios que existem hoje, nenhum vive só no mar. Mas, há 237 milhões de anos, um vivia.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.pond), key(W("s1", 9) - 4, P.pond2, "linear"), key(W("s1", 12), P.sea, "inOut"), ...cut(W("s1", 14), P.sea, P.floorSil), key(end(0), P.floorSil2, "linear")] },
    objects: [{ id: "pond", type: "Lagoa + sapo, salamandra", visible: true }, { id: "sea", type: "Mar", visible: true }, { id: "silhouette", type: "Gerrothorax(silhueta)", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "pond"), ...ZERO.map((t) => set(t, 0, 0)), set("shrink", 0, 1), set("gerro.ghost", 0, 1),
      lin("count", W("s1", 1), W("s1", 5) + 6, 0, 8000, "out", "count"), pop("seaX", W("s1", 12)), ...fx.punch(W("s1", 12)), popOut("count", W("s1", 12), 8),
      whipMid(W("s1", 14)), popOut("seaX", W("s1", 14), 4), ...world(W("s1", 14), "sea"), ...fx.desaturate(W("s1", 14), W("s1", 20), 0.4), lin("sil", W("s1", 16), W("s1", 20), 0, 1), lin("gerro.ghost", W("s1", 20), W("s1", 21) + 8, 1, 0),
    ],
    badges: [
      { text: "+8.000 ANFÍBIOS HOJE", variant: "info", appearAt: W("s1", 2), disappearAt: W("s1", 9) },
      { text: "NENHUM SÓ NO MAR", variant: "negative", appearAt: W("s1", 9), disappearAt: W("s1", 15) },
      { text: "HÁ 237 MILHÕES DE ANOS", variant: "warning", size: "large", appearAt: W("s1", 15) },
    ],
    highlights: ["OITO", "MIL", "ANFÍBIOS", "NENHUM", "MAR.", "237", "MILHÕES", "VIVIA"],
    captions: [cap("s1", 0, "Dos mais de oito mil anfíbios que existem hoje, nenhum vive só no mar. Mas, há 237 milhões de anos, um vivia.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("ocean-amb", W("s1", 10), 0.2), sfx("buzz", W("s1", 12), 0.25), sfx("rewind", W("s1", 14), 0.3), sfx("deep-amb", W("s1", 14), 0.25)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "O problema é a pele: fina, ela deixa a água passar. No mar, o sal puxa a água do corpo, e o bicho desidrata.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.skin), key(end(1), P.skin2, "linear")] },
    objects: [{ id: "skin", type: "SkinBlock(corte)", visible: true }, { id: "frog", type: "Frog(murchando)", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "skin"), set("seal.k", 0, 1), lin("skin.in", W("s2", 6), W("s2", 10), 0, 1), popOut("skin.in", W("s2", 12), 6),
      lin("salt", W("s2", 13), W("s2", 15), 0, 1), lin("skin.out", W("s2", 15), W("s2", 17), 0, 1), lin("shrink", W("s2", 17), W("s2", 23) + 6, 1, 0.72, "inOut"), ...fx.shake(W("s2", 23), 14),
    ],
    badges: [
      { text: "PELE QUE DEIXA A ÁGUA PASSAR", variant: "info", appearAt: W("s2", 4), disappearAt: W("s2", 13) },
      { text: "O SAL PUXA A ÁGUA", variant: "negative", appearAt: W("s2", 13) },
    ],
    highlights: ["PELE", "FINA", "ÁGUA", "PASSAR", "SAL", "PUXA", "DESIDRATA"],
    captions: [cap("s2", 1, "O problema é a pele: fina, ela deixa a água passar. No mar, o sal puxa a água do corpo, e o bicho desidrata.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.35), sfx("drip", W("s2", 7), 0.35), sfx("dust", W("s2", 14), 0.3), sfx("drain", W("s2", 17), 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Na China, cientistas estudaram dois esqueletos quase completos. O bicho tinha quase um metro, era achatado e coberto de placas de osso.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.lab), key(W("s3", 8), P.lab2, "inOut"), key(end(2), P.lab3, "linear")] },
    objects: [{ id: "fossils", type: "FossilSlab×2", visible: true }, { id: "ruler", type: "Régua 1 m", visible: true }, { id: "model", type: "Gerrothorax(montando sobre o fóssil)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "lab"), set("seal.k", 0, 0), set("shrink", 0, 1), pop("fossil.k", 2), pop("ruler.k", W("s3", 11)), lin("armor.k", W("s3", 14), W("s3", 21) + 8, 0, 1, "inOut"),
      ...mascot.place(add(LAB, [0.55, 0, 0.6]), -0.6, 0.5, 0), ...mascot.float(0, false, 1), ...mascot.wave(4, 30), ...mascot.point(W("s3", 12), 40, -1.2),
    ],
    badges: [
      { text: "CHINA · 2 ESQUELETOS", variant: "info", appearAt: W("s3", 1), disappearAt: W("s3", 11) },
      { text: "QUASE 1 METRO", variant: "info", appearAt: W("s3", 11), disappearAt: W("s3", 17) },
      { text: "ARMADURA DE OSSO", variant: "positive", appearAt: W("s3", 17) },
    ],
    highlights: ["CHINA", "DOIS", "ESQUELETOS", "METRO", "ACHATADO", "PLACAS", "OSSO"],
    captions: [cap("s3", 2, "Na China, cientistas estudaram dois esqueletos quase completos. O bicho tinha quase um metro, era achatado e coberto de placas de osso.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.35), sfx("clunk", 4, 0.3), sfx("tick", W("s3", 11), 0.3), sfx("shimmer", W("s3", 17), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "O nome dele é Gerrothorax maritimus. Mas como saber que vivia no mar, e não foi só arrastado pra lá depois de morto?",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.hero), key(W("s4", 6) - 1, P.hero2, "linear"), key(W("s4", 6), P.drift), key(end(3), orbit(add(SEA, [0.6, 0.2, 0]), 15, 6, 12), "linear")] },
    objects: [{ id: "gerro", type: "Gerrothorax", visible: true }, { id: "drift", type: "Corpo levado pela correnteza (flashback)", visible: true }, { id: "q", type: "?2D", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "sea"), ...mascot.hide(0, 4), set("armor.k", 0, 1), set("sealI.k", 0, 1), set("gerro.ghost", 0, 0),
      whipMid(W("s4", 6)), ...fx.desaturate(W("s4", 6), end(3), 0.3), lin("drift.t", W("s4", 6), end(3), 0, 1, "linear"), pop("q.k", W("s4", 17)),
    ],
    badges: [
      { text: "GERROTHORAX MARITIMUS", variant: "info", size: "large", appearAt: W("s4", 4), disappearAt: W("s4", 7) },
      { text: "OU FOI ARRASTADO?", variant: "warning", icon: "?", appearAt: W("s4", 15) },
    ],
    highlights: ["GERROTHORAX", "MARITIMUS", "SABER", "MAR", "ARRASTADO", "MORTO"],
    captions: [cap("s4", 3, "O nome dele é Gerrothorax maritimus. Mas como saber que vivia no mar, e não foi só arrastado pra lá depois de morto?")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.35), sfx("glow", W("s4", 4), 0.35), sfx("rush", W("s4", 6), 0.25), sfx("tick", W("s4", 17), 0.3)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "As rochas onde ele estava se formaram longe de qualquer terra, junto com ictiossauros, répteis marinhos.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.map), key(end(4), P.map2, "linear")] },
    objects: [{ id: "map", type: "Mapa esquemático (costa longe)", visible: true }, { id: "ichthy", type: "Ichthyosaur", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "map"), set("q.k", 0, 0), set("sealI.k", 0, 0), set("seal.k", 0, 1), lin("coast.k", W("s5", 1), W("s5", 10), 0, 1, "inOut"), lin("ichthy.t", W("s5", 11), end(4), 0, 1, "linear"), ...fx.flash(W("s5", 13), 6)],
    badges: [
      { text: "PISTA 1: LONGE DA TERRA", variant: "positive", appearAt: W("s5", 1), disappearAt: W("s5", 12) },
      { text: "VIZINHOS: ICTIOSSAUROS", variant: "info", appearAt: W("s5", 12) },
    ],
    highlights: ["ROCHAS", "LONGE", "TERRA", "ICTIOSSAUROS", "MARINHOS"],
    captions: [cap("s5", 4, "As rochas onde ele estava se formaram longe de qualquer terra, junto com ictiossauros, répteis marinhos.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.35), sfx("ding", W("s5", 7), 0.3), sfx("bubbles", W("s5", 12), 0.35)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "E a prova química: o estrôncio dos ossos tem a assinatura da água do mar daquela época.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.bone), key(end(5), P.bone2, "linear")] },
    objects: [{ id: "bone", type: "BoneSection + átomos de estrôncio", visible: true }, { id: "match", type: "Assinaturas 2D que coincidem", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "bone"), lin("sr.glow", W("s6", 4), W("s6", 6) + 6, 0, 1), lin("match.k", W("s6", 9), W("s6", 14), 0, 1, "inOut"), ...fx.flash(W("s6", 14), 6)],
    badges: [
      { text: "PISTA 2: ESTRÔNCIO", variant: "info", appearAt: W("s6", 3), disappearAt: W("s6", 12) },
      { text: "= ÁGUA DO MAR", variant: "positive", size: "large", appearAt: W("s6", 12) },
    ],
    highlights: ["PROVA", "QUÍMICA", "ESTRÔNCIO", "OSSOS", "ASSINATURA", "MAR"],
    captions: [cap("s6", 5, "E a prova química: o estrôncio dos ossos tem a assinatura da água do mar daquela época.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.35), sfx("glow", W("s6", 5), 0.35), sfx("ding", W("s6", 14), 0.4)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "A hipótese é que a armadura segurava a água dentro do corpo, e que ele vivia no fundo, sugando as presas.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.bury), key(end(6), P.bury2, "linear")] },
    objects: [{ id: "gerro", type: "Gerrothorax(semi-enterrado)", visible: true }, { id: "shield", type: "Escudo de água", visible: true }, { id: "prey", type: "Fish(presa)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "sea"), set("seal.k", 0, 0), set("sealI.k", 0, 1), set("drift.t", 0, 0), set("gerro.ghost", 0, 0), pop("shield.k", W("s7", 5)), popOut("shield.k", W("s7", 12), 10),
      lin("bury", W("s7", 13), W("s7", 17), 0, 1, "inOut"), lin("prey.t", W("s7", 16), W("s7", 18) + 10, 0, 1, "in"), ...fx.punch(W("s7", 18) + 8),
    ],
    badges: [
      { text: "HIPÓTESE: ARMADURA = ESCUDO", variant: "warning", appearAt: W("s7", 1), disappearAt: W("s7", 15) },
      { text: "CAÇAVA POR SUCÇÃO", variant: "info", appearAt: W("s7", 15) },
    ],
    highlights: ["HIPÓTESE", "ARMADURA", "ÁGUA", "CORPO", "FUNDO", "SUGANDO", "PRESAS"],
    captions: [cap("s7", 6, "A hipótese é que a armadura segurava a água dentro do corpo, e que ele vivia no fundo, sugando as presas.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.35), sfx("glow", W("s7", 5), 0.3), sfx("bubbles", W("s7", 18), 0.35), sfx("pop", W("s7", 18) + 8, 0.35)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. O único anfíbio marinho conhecido não deixou descendentes.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "gerro", type: "Gerrothorax", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true }],
    animations: [
      ...fx.whipIn(), lin("bury", 0, 20, undefined, 0.3), set("prey.t", 0, 0), ...mascot.place(add(SEA, [1.3, 0.5, -0.9]), -0.7, 0.38, 0, 10), ...mascot.float(0, true, 1), ...mascot.cheer(W("s8", 1), 40), ...mascot.wave(W("s8", 9), 40),
    ],
    badges: [{ text: "LINHAGEM SEM DESCENDENTES", variant: "info", appearAt: W("s8", 5), disappearAt: end(7) - s(5.3) }],
    highlights: ["PRONTO", "ÚNICO", "ANFÍBIO", "MARINHO", "DESCENDENTES"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. O único anfíbio marinho conhecido não deixou descendentes.")],
    audioCues: [narration("s8"), sfx("final", W("s8", 0), 0.4)],
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
void cut;
