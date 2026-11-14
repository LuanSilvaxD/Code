import type { Vec3 } from "../utils/animation";

// Mundos da "contramão no Sistema Solar" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const SOLAR: Vec3 = [0, 0, 0]; // Sistema Solar (plano xz) + órbita da R631
export const ROCKW: Vec3 = [0, -200, 0]; // close da rocha
export const OBS: Vec3 = [0, -300, 0]; // observatório na montanha
export const DISK: Vec3 = [0, -400, 0]; // disco de gás
export const NEP: Vec3 = [0, -500, 0]; // Netuno + cinturão de Kuiper (hipótese 1)
export const STAR: Vec3 = [0, -600, 0]; // outra estrela → Sol (hipótese 2)
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Parâmetro u (rad) da R631 na órbita em função do frame (anda no sentido contrário dos planetas). */
export const r631U = (f: number) => 2.2 + f * 0.0045;
/** "Tempo" dos planetas (rad da Terra) em função do frame. */
export const sysT = (f: number) => 1.2 + f * 0.018;
