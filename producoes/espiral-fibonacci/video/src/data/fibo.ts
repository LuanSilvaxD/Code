import type { Vec3 } from "../utils/animation";

// Mundos da "espiral de Fibonacci" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const FLOWER: Vec3 = [0, 0, 0]; // girassol de frente (+z), caule para baixo
export const RABBITS: Vec3 = [0, -200, 0]; // gramado dos coelhos
export const SQUARES: Vec3 = [0, -300, 0]; // quadrados de Fibonacci (plano xy, de frente)
export const COMPARE: Vec3 = [0, -400, 0]; // 137,5° (grande) × 120° e 90° (pequenos)
export const PLANTS: Vec3 = [0, -500, 0]; // pinha e abacaxi
export const NAUTILUS: Vec3 = [0, -600, 0]; // concha em corte (plano xy)
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Inclinação do miolo (rad): quase de frente, levemente para cima, como um girassol de verdade. */
export const FLOWER_TILT = Math.PI / 2 - 0.12;
export const CMP_BIG: Vec3 = add(COMPARE, [0, 1.75, 0]);
export const CMP_120: Vec3 = add(COMPARE, [-1.45, -1.75, 0]);
export const CMP_90: Vec3 = add(COMPARE, [1.45, -1.75, 0]);
export const PINE_P: Vec3 = add(PLANTS, [-1.25, 0, 0]);
export const ANANAS_P: Vec3 = add(PLANTS, [1.3, -0.15, 0]);
/** Casais de coelhos no gramado por etapa (1, 1, 2, 3, 5 casais). */
export const PAIRS = [1, 1, 2, 3, 5];
export const PAIR_POS: Vec3[] = [
  [-0.2, 0, 0.6],
  [1.5, 0, -0.5],
  [-1.8, 0, -0.4],
  [0.9, 0, 1.7],
  [-1.3, 0, 1.6],
];
