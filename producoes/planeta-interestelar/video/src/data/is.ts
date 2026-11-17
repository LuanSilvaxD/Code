import type { Vec3 } from "../utils/animation";

// Mundos do "Filme × Realidade #1 — planeta do Interestelar" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const SPACE: Vec3 = [0, 0, 0]; // buraco negro + planeta-oceano em órbita
export const GRID: Vec3 = [0, -200, 0]; // malha do espaço-tempo + relógios
export const GPS: Vec3 = [0, -300, 0]; // Terra + satélite de GPS
export const SEA: Vec3 = [0, -400, 0]; // pouso: oceano raso + onda gigante + buraco negro no céu
export const CMB: Vec3 = [0, -500, 0]; // planeta + brilho do Big Bang chegando
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Ângulo (rad) fixo do planeta na órbita (o tempo lá passa devagar — ele quase não anda). */
export const PLANET_ANG = 0.75;
export const planetPos = (r: number): Vec3 => [Math.cos(PLANET_ANG) * r, 0.25, Math.sin(PLANET_ANG) * r];
/** Posição do buraco negro no céu do mundo SEA (relativa a SEA). */
export const SKY_BH: Vec3 = [4, 19, -70];
