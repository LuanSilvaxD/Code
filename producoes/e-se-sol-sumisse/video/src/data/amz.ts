import type { Vec3 } from "../utils/animation";

// Mundos do "Cidade perdida na Amazônia" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const FOR: Vec3 = [0, 0, 0]; // diorama da floresta (Ratanabá, LiDAR, Upano)
export const CAS: Vec3 = [0, -200, 0]; // Casarabe (Bolívia)
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Mascote em escala real ao pé da pirâmide (relativo a CAS). */
export const CAS_PERSON: Vec3 = [1.32, 0.0, 1.0];
