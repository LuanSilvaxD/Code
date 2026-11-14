import type { Vec3 } from "../utils/animation";

// Mundos do "Acharam a Arca de Noé?" (só o ativo é desenhado). LAND e GEO em 1 u = 10 m; WOOD, DRILL e FIRE em metros.
export const LAND: Vec3 = [0, 0, 0]; // planalto, Durupinar na origem, Ararat ao fundo
export const WOOD: Vec3 = [0, -200, 0]; // madeira carbonizada na lona
export const GEO: Vec3 = [0, -300, 0]; // corte geológico (esquema)
export const DRILL: Vec3 = [0, -400, 0]; // sonda e testemunho
export const FIRE: Vec3 = [0, -500, 0]; // fogueira, pastor e ovelhas
export const ARARAT_P: Vec3 = [-30, 0, -110];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
