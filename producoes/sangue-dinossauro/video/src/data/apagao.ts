import type { Vec3 } from "../utils/animation";

// Mundos do "apagão mundial" (lado a lado no mesmo canvas; só o mundo ativo é desenhado — tracks *.show).
// Globo, Sol, satélite, Itaipu e mapa: u3d ESQUEMÁTICOS. Sala: 1 u3d = 1 m.
export const GLOBE: Vec3 = [0, 0, 0];
export const GLOBE_R = 3;
export const SUN: Vec3 = [-17, 1.5, -5];
export const SUN_R = 3.2;
export const SATELLITE: Vec3 = [-8, 1.6, -2.4];
export const ROOM: Vec3 = [0, -200, 0];
export const ITAIPU: Vec3 = [0, -300, 0];
export const BRAZIL: Vec3 = [0, -400, 0];
/** escala do mascote: sala em metros (1,6 m); visitante do globo/mapa (esquemático) */
export const MS_ROOM = 1.6 / 1.8;
export const MS_SPACE = 0.8;
export const MS_MAP = 0.42;
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** azimute (graus) da câmera que olha de frente a longitude `lon` do globo sem giro */
export const azOf = (lon: number) => (Math.atan2(Math.cos((lon * Math.PI) / 180), -Math.sin((lon * Math.PI) / 180)) * 180) / Math.PI;
