import type { Vec3 } from "../utils/animation";

// Mundos do "Por que 2026 está tão quente?" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const EARTH: Vec3 = [0, 0, 0]; // Terra + cobertor (efeito estufa)
export const ESC: Vec3 = [0, -200, 0]; // escada rolante + termômetro
export const PAC: Vec3 = [0, -300, 0]; // Pacífico em corte (El Niño)
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Posição do termômetro gigante no mundo ESC (relativa). */
export const THERMO_AT: Vec3 = [-0.6, 2.4, -2.6];
