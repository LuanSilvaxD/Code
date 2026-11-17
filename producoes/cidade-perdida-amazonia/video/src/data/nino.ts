import type { Vec3 } from "../utils/animation";

// Mundos do "El Niño 2026–2027" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const PAC: Vec3 = [0, 0, 0]; // Pacífico em corte + barco de pesca
export const BR: Vec3 = [0, -200, 0]; // mapa do Brasil 3D
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Barco perto da costa da América do Sul (relativo a PAC). */
export const BOAT: Vec3 = [3.9, 0.0, 1.1];
