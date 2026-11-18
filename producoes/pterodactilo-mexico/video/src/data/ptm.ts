import type { Vec3 } from "../utils/animation";

// Mundos do "Pterodáctilo no México?" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const JU: Vec3 = [0, 0, 0]; // Ciudad Juárez à noite (diorama: 1 m ≈ 0,3 u)
export const FT: Vec3 = [0, -200, 0]; // árvore da família
export const MP: Vec3 = [0, -400, 0]; // mapa da fronteira
export const SC: Vec3 = [0, -600, 0]; // escala (1 u = 1 m)
export const CR: Vec3 = [0, -800, 0]; // mesmo lugar há 70 milhões de anos
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Onde a silhueta cruza a lua (relativo a JU). */
export const SKY: Vec3 = [1.6, 4.4, -6];
/** Quetzalcoatlus na cena de escala (relativo a SC). */
export const QSC: Vec3 = [0.4, 3.8, -0.6];
