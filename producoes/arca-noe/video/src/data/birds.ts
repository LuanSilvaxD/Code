import type { Vec3 } from "../utils/animation";

// Mundos dos "pássaros que ouviram a tempestade" (só o ativo é desenhado). u3d esquemáticos; pássaro em decímetros.
export const FOREST: Vec3 = [0, 0, 0]; // galho com o bando, floresta ao fundo, céu
export const MAP: Vec3 = [0, -200, 0]; // mapa esquemático da rota
export const VIEW: Vec3 = [0, -300, 0]; // floresta calma com a tempestade no horizonte (ondas chegando)
export const STORM: Vec3 = [0, -400, 0]; // close da supercélula
export const HIT: Vec3 = [0, -500, 0]; // floresta sendo atingida, galho vazio
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const BRANCH_Y = 2.5;
/** Posições dos pássaros no galho (x) */
export const PERCH = [-1.05, -0.3, 0.45, 1.15];
