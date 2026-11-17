import type { Vec3 } from "../utils/animation";

// Mundos do "Existe um Planeta X?" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const DEEP: Vec3 = [0, 0, 0]; // Sistema Solar visto de longe + silhueta escura com "?"
export const OLD: Vec3 = [0, -200, 0]; // observatório antigo (época de Lowell), tom sépia
export const PLU: Vec3 = [0, -300, 0]; // Netuno × Plutão
export const NIB: Vec3 = [0, -400, 0]; // Nibiru × Terra (boato)
export const SOL: Vec3 = [0, -500, 0]; // Sistema Solar de cima + órbitas alinhadas + Planeta Nove (esquema)
export const P9W: Vec3 = [0, -600, 0]; // Planeta Nove de perto (ilustração)
export const OBS: Vec3 = [0, -700, 0]; // observatório v2 (estilo Rubin), noite
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** "Tempo" dos planetas (rad da Terra) em função do frame. */
export const sysT = (f: number) => 1.2 + f * 0.014;
/** Posição esquemática do Planeta Nove no mundo SOL (no lado para onde as órbitas alinhadas se esticam — esquema). */
export const P9_POS: Vec3 = [51.6, 0, -6.2];
