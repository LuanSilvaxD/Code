import type { Vec3 } from "../utils/animation";

// Mundos do "único anfíbio que vivia no mar" (só o ativo é desenhado — tracks *.show). METROS, exceto o mapa (esquema).
export const POND: Vec3 = [0, 0, 0]; // beira de lagoa (anfíbios de hoje) + mar ao lado
export const SKIN: Vec3 = [0, -200, 0]; // pele em corte (esquema)
export const LAB: Vec3 = [0, -300, 0]; // mesa com os dois fósseis
export const SEA: Vec3 = [0, -400, 0]; // fundo do mar triássico
export const MAP: Vec3 = [0, -500, 0]; // mapa esquemático do mar (costa longe)
export const BONE: Vec3 = [0, -600, 0]; // osso em corte (estrôncio)
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const SEA_SHORE_X = 1.6; // na lagoa, o mar começa em x > 1,6
