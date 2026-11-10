import { sceneAt, track } from "../data/scenes";
import { clamp, lerp } from "../utils/animation";

// Diorama ESQUEMÁTICO: terreno em corte (face em z = +3) com quatro "tells".
// A régua do tempo começa no topo do morro (y = TOP) e desce: 1 u3d ≈ 2.500 anos.

export const Z_FRONT = 3;
export const Z_BACK = -2.6;
export const GROUND_Y = 0;
export const BASE_Y = -6.2;
export const X_MIN = -30;
export const X_MAX = 30;
export const TOP = 0.9;
export const YEARS_PER_U = 2500;

export type TellId = "rome" | "catal" | "jericho" | "damascus";

export type Tell = {
  id: TellId;
  name: string;
  x: number;
  top: number;
  bottom: number;
  layers: number;
  wBottom: number;
  wTop: number;
  palette: string[];
  /** índices (de baixo para cima) de camadas vazias */
  gaps?: number[];
  /** abaixo das camadas conhecidas: zona desconhecida até esta profundidade */
  unknownTo?: number;
};

export const TELLS: Record<TellId, Tell> = {
  rome: { id: "rome", name: "ROMA", x: -22, top: 0.45, bottom: TOP - 1.1, layers: 3, wBottom: 3.6, wTop: 3.0, palette: ["#a8794f", "#c39463", "#d7b07d"] },
  catal: { id: "catal", name: "ÇATALHÖYÜK", x: -8, top: TOP, bottom: TOP - 3.6, layers: 8, wBottom: 3.8, wTop: 1.7, palette: ["#6e4c35", "#7b553b", "#8a6143", "#976c4b", "#a67954", "#b5875f", "#c4966b", "#d0a578"] },
  jericho: { id: "jericho", name: "JERICÓ", x: 6, top: TOP, bottom: TOP - 4.4, layers: 10, wBottom: 4.0, wTop: 1.9, palette: ["#5f412e", "#6b4a34", "#77533a", "#835c40", "#8f6546", "#9b6f4d", "#a77954", "#b3845c", "#bf8f65", "#cb9b6f"], gaps: [3, 6] },
  damascus: { id: "damascus", name: "DAMASCO", x: 20, top: TOP, bottom: TOP - 1.6, layers: 4, wBottom: 3.9, wTop: 3.1, palette: ["#9c7350", "#ad835c", "#be9469", "#cfa577"], unknownTo: TOP - 4.4 },
};

export const TELL_LIST: Tell[] = [TELLS.rome, TELLS.catal, TELLS.jericho, TELLS.damascus];

/** Camada i (0 = mais funda): limites verticais e meia-largura. */
export const layerBox = (t: Tell, i: number) => {
  const h = (t.top - t.bottom) / t.layers;
  const y0 = t.bottom + i * h;
  const y1 = y0 + h;
  const k = (i + 0.5) / t.layers;
  return { y0, y1, half: lerp(t.wBottom, t.wTop, k) / 2 + (y1 > 0 ? 0 : 0.6) };
};

/** Morro em foco por cena (os outros ficam escurecidos pela trilha others.dim). */
const FOCUS: Record<string, TellId[]> = {
  "scene-01-gancho": ["rome"],
  "scene-02-camadas": ["catal"],
  "scene-03-tell": ["catal"],
  "scene-04-catalhoyuk": ["catal"],
  "scene-05-abandonada": ["catal"],
  "scene-06-jerico": ["jericho"],
  "scene-07-intervalos": ["jericho"],
  "scene-08-regra-dois": ["catal", "jericho"],
  "scene-09-provas": ["damascus"],
  "scene-10-candidata": ["damascus"],
  "scene-11-pistas": ["damascus"],
  "scene-12-damasco": ["damascus"],
  "scene-13-depende": ["jericho", "damascus"],
  "scene-14-final": ["rome", "catal", "jericho", "damascus"],
};

export const focusOf = (frame: number) => FOCUS[sceneAt(frame).id] ?? [];

/** 1 = cor normal; menor = escurecido. */
export const dimOf = (id: TellId, frame: number) => {
  if (focusOf(frame).includes(id)) return 1;
  return clamp(track("others.dim", frame, 1), 0, 1);
};

/** Morro principal da régua do tempo na cena. */
export const rulerTell = (frame: number): Tell | null => {
  const f = focusOf(frame);
  if (f.length !== 1) return null;
  return TELLS[f[0]];
};

export const rulerX = (t: Tell) => t.x - t.wBottom / 2 - 1.15;
