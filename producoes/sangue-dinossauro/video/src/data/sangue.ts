import type { Vec3 } from "../utils/animation";

// Mundos do "sangue de dinossauro" (só o ativo é desenhado — tracks *.show).
// Diorama, mina e museu em METROS; osso, canal, heme e DNA em u3d ESQUEMÁTICOS.
export const DIORAMA: Vec3 = [0, 0, 0];
export const BONE: Vec3 = [0, -200, 0];
export const DNA: Vec3 = [0, -300, 0];
export const MAP: Vec3 = [0, -400, 0];
export const MINE: Vec3 = [0, -500, 0];
export const MUSEUM: Vec3 = [0, -600, 0];
// peças dentro do mundo OSSO
export const SECTION: Vec3 = [4.2, -199.4, 0];
export const CANAL: Vec3 = [11, -199.5, 0];
export const HEME: Vec3 = [18, -199.5, 0];
export const SPLIT: Vec3 = [25, -199.5, 0];
// peças dentro do mundo DNA
export const HOURGLASS: Vec3 = [2.3, -300.2, 0];
export const AMBER: Vec3 = [7, -299.6, 0];
export const DINO_Z = 0.4;
export const MS_DIO = 0.45;
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
