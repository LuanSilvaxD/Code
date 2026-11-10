import { track } from "../data/scenes";
import { clamp, smoothstep } from "../utils/animation";

// Física ESQUEMÁTICA do diorama (funções puras do frame global).
// Eixo x = perfil mar aberto → costa. y = altura (nível do mar em 0). Escala vertical exagerada.
//   fossa x≈-24 · planície abissal -20..6 (y=-4.2 ≙ 4.000 m) · talude 6..12 · plataforma 12..22 · praia 22..25
//   cidade 26..29.5 · morro 31..34.

export const X_MIN = -34;
export const X_MAX = 34;
export const Z_HALF = 2;
export const BASE_Y = -7.4;
export const DEEP_Y = -4.2;
export const SHIP_X = -8;

const PROFILE: [number, number][] = [
  [-34, -4.45],
  [-28, -4.5],
  [-24, -5.05],
  [-21.5, -4.35],
  [-18, -4.2],
  [6, -4.2],
  [12, -0.95],
  [17, -0.6],
  [22, -0.36],
  [25, 0.22],
  [27, 0.32],
  [30.5, 0.4],
  [32, 1.3],
  [33, 2.05],
  [34, 2.15],
];

/** Fundo/terreno base (sem o soerguimento do terremoto). */
export const baseFloor = (x: number) => {
  if (x <= PROFILE[0][0]) return PROFILE[0][1];
  for (let i = 1; i < PROFILE.length; i++) {
    const [x1, y1] = PROFILE[i];
    if (x <= x1) {
      const [x0, y0] = PROFILE[i - 1];
      const t = smoothstep((x - x0) / (x1 - x0));
      return y0 + (y1 - y0) * t;
    }
  }
  return PROFILE[PROFILE.length - 1][1];
};

/** Forma do soerguimento da placa de cima (0..1), concentrada entre a fossa e x≈-15. */
export const upliftShape = (x: number) => {
  if (x < -23.4 || x > -14) return 0;
  const t = (x - -23.4) / (-14 - -23.4);
  return Math.sin(Math.PI * t) ** 1.2;
};

export const floorY = (x: number, frame: number) => baseFloor(x) + track("seafloor.uplift", frame) * upliftShape(x);

/** Profundidade local (u3d, ≥ 0.06) usada na velocidade/forma da onda. */
export const depthAt = (x: number) => Math.max(0.06, -baseFloor(x));

const sech2 = (u: number) => {
  const c = Math.cosh(clamp(u, -20, 20));
  return 1 / (c * c);
};

/** Meia-largura da crista: L ∝ √h (a onda encurta no raso). */
export const waveWidth = (h: number) => 0.7 + 3.3 * Math.sqrt(clamp(h / 4.2, 0, 1.2));

/** Amplitude (com exagero 1): cresce no raso (expoente exagerado em relação à lei de Green, com teto). */
export const waveAmp = (h: number) => Math.min(2.0, 0.34 * Math.pow(4.2 / h, 0.55));

/** Fator vertical: 0 = escala "real" (praticamente plana), 1 = exagerada. */
export const exaggeration = (frame: number) => 0.035 + 0.965 * clamp(track("view.exaggeration", frame), 0, 1);

/** Elevação da superfície do mar provocada pelo tsunami. */
export const waveEta = (x: number, frame: number) => {
  const on = clamp(track("tsunami.on", frame, 1), 0, 1.3);
  if (on <= 0.0005) return 0;
  const xf = track("tsunami.x", frame, -14);
  const h = depthAt(xf);
  const L = waveWidth(h);
  const A = waveAmp(h) * exaggeration(frame) * on;
  // frente mais íngreme perto da costa
  const steep = clamp((xf - 8) / 14, 0, 1);
  const Lf = L * (1 - 0.55 * steep);
  const u = x >= xf ? (x - xf) / Lf : (x - xf) / L;
  let eta = A * sech2(u);
  // vale à frente da crista (o mar "recua" antes de a crista chegar)
  const trough = clamp(track("tsunami.trough", frame), 0, 1);
  if (trough > 0) eta -= trough * 0.5 * A * sech2((x - (xf + 1.9 * Lf)) / (1.1 * Lf));
  return eta;
};

/** Recuo explícito do mar na praia (cena 12) e a inundação terra adentro (cena 13). */
export const coastWater = (x: number, frame: number) => {
  const draw = clamp(track("coast.drawdown", frame), 0, 1);
  const inund = clamp(track("coast.inundation", frame), 0, 1);
  let d = 0;
  if (draw > 0) d -= draw * 0.62 * smoothstep((x - 15) / 6);
  if (inund > 0) {
    const edge = 22 + 9.6 * smoothstep(inund * 1.15);
    const level = 1.02 * smoothstep(clamp(inund * 3, 0, 1)) * (1 - 0.18 * smoothstep((x - 24) / 7));
    const front = clamp((edge - x) / 1.4, 0, 1);
    d = Math.max(d, (level + 0.05 * Math.sin(x * 2.3 + frame * 0.3)) * front * smoothstep((x - 17) / 5));
  }
  return d;
};

/** Superfície da água (sem as marolas). */
export const surfaceY = (x: number, frame: number) => waveEta(x, frame) + coastWater(x, frame);

/** Marolas normais do mar (decoração leve, só na superfície). */
export const chop = (x: number, z: number, frame: number) => {
  const k = clamp(track("ocean.chop", frame, 1), 0, 1);
  return k * (0.018 * Math.sin(x * 3.1 + frame * 0.11 + z * 1.7) + 0.012 * Math.sin(x * 5.3 - frame * 0.07 - z * 2.3));
};

/** Ponto de referência da crista no frame (x, y). */
export const crest = (frame: number) => {
  const xf = track("tsunami.x", frame, -14);
  return { x: xf, y: surfaceY(xf, frame), L: waveWidth(depthAt(xf)) };
};
