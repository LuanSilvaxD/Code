import type { Vec3 } from "../utils/animation";

// Mundos do "O Jack cabia na porta?" (só o ativo é desenhado — tracks *.show). 1 u = 1 m perto da câmera.
export const SEA: Vec3 = [0, 0, 0]; // mar à noite (painel, navio ao longe, bote)
export const MUS: Vec3 = [0, -200, 0]; // museu (painel em pé + vitrine)
export const SL: Vec3 = [0, -400, 0]; // corte da água (flutuação)
export const TK: Vec3 = [0, -600, 0]; // tanque de teste
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Painel no mar (relativo a SEA). */
export const PAN: Vec3 = [0.3, 0, 0.6];
