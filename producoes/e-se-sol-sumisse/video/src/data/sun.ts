import type { Vec3 } from "../utils/animation";

// Mundos do "E se o Sol sumisse?" (só o ativo é desenhado — tracks *.show). u3d esquemáticos.
export const SP: Vec3 = [0, 0, 0]; // espaço: Sol em cima, Terra embaixo (órbita no plano XY, de frente para a câmera)
export const TR: Vec3 = [0, -200, 0]; // árvore murchando
export const OC: Vec3 = [0, -400, 0]; // oceano em corte
export const VE: Vec3 = [0, -600, 0]; // fonte hidrotermal (fundo do mar)
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Sol (relativo a SP) e raio da órbita esquemática. */
export const SUN: Vec3 = [0, 5.2, 0];
export const ORBIT_R = 6.0;
export const EARTH_R = 0.8;
export const SUN_R = 1.8;
/** Ângulo (graus) onde a Terra sai da órbita (Sol em cima à esquerda, Terra embaixo à direita). */
export const DEPART_DEG = -62;
/** Posição da Terra: na órbita (ângulo th em graus) ou, depois de sair, em linha reta (lx u3d ao longo da tangente). */
export const earthPos = (th: number, lx: number): Vec3 => {
  const a = ((lx > 0 ? DEPART_DEG : th) * Math.PI) / 180;
  const p: Vec3 = [SUN[0] + Math.cos(a) * ORBIT_R, SUN[1] + Math.sin(a) * ORBIT_R, 0];
  if (lx <= 0) return p;
  return [p[0] - Math.sin(a) * lx, p[1] + Math.cos(a) * lx, 0];
};
