import type { Vec3 } from "../utils/animation";

// Mundos do "universo invisível" (só o ativo é desenhado — tracks *.show). Tudo em u3d esquemáticos.
export const COSMOS: Vec3 = [0, 0, 0]; // pizza, galáxias
export const PIE: Vec3 = [0, 0, 0];
export const GAL: Vec3 = [0, 0, -14]; // galáxia principal (s2)
export const SPLIT_A: Vec3 = [-4.2, 0, -30];
export const SPLIT_B: Vec3 = [4.2, 0, -30];
export const FIELD: Vec3 = [0, 0, -50];
export const SOLAR: Vec3 = [0, -300, 0]; // Terra em SOLAR; Sol à esquerda; Euclid à direita
export const SUN_P: Vec3 = [-12, -300, 0];
export const EUCLID_P: Vec3 = [6, -300, 0];
export const LENS: Vec3 = [0, -400, 0];
export const WEB: Vec3 = [0, -500, 0];
export const ICE: Vec3 = [0, -600, 0];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
