import map from "./france.json";
import { worldScale } from "../components/Person";
import type { Vec3 } from "../utils/animation";

// Lugares do EP. 02 no mapa-maquete (u3d). O mapa é ESQUEMÁTICO; dentro de cada estação vale UMA régua:
// 1 m = U u3d (pessoa 1,7 m = 0,068 u3d). Estações em <group position={ST.x} scale={U}> com conteúdo em METROS.

export const U = 0.04;
export const PS = worldScale(U).person;
export const MS = worldScale(U).mascot;
export const LAND_H = 0.12;

const C = map.cities as unknown as Record<string, [number, number]>;
/** chão das estações: um pouco acima das camadas do mapa (verde, manchas, rios, fronteira) */
export const BASE_Y = LAND_H + 0.045;
const at = (k: string, dx = 0, dz = 0): Vec3 => [C[k][0] + dx, BASE_Y, C[k][1] + dz];

/** Origem de cada estação (as cidades próximas foram afastadas um pouco: o mapa é esquemático). */
export const ST = {
  village: at("village", 0, 0.15),
  vaucouleurs: at("vaucouleurs", 0, -1.1),
  chinon: at("chinon"),
  orleans: at("orleans", 0, -1.68), // a cidade fica ao norte do Loire: o rio da miniatura cai sobre o Loire do mapa
  reims: at("reims", 0, 0.3),
  compiegne: at("compiegne", 0, -0.2),
  rouen: at("rouen"),
  pyre: at("rouen", 1.5, 0.45),
  paris: at("paris", 0.2, -0.6),
} satisfies Record<string, Vec3>;
export type Station = keyof typeof ST;

/** Ponto do mundo a partir de uma estação + deslocamento local em METROS (x, z) e altura em metros. */
export const loc = (st: Station, x = 0, z = 0, y = 0): Vec3 => [ST[st][0] + x * U, ST[st][1] + y * U, ST[st][2] + z * U];

/** Rota da viagem (roxa) e trecho como prisioneira (vermelho). */
export const ROUTE: Vec3[] = [loc("village", -3, 9), loc("vaucouleurs", 0, 14), loc("chinon", 0, 8), loc("orleans", 0, 30), loc("reims", 0, 10), loc("compiegne", 0, 12)];
export const CAPTIVE: Vec3[] = [loc("compiegne", 0, 12), loc("rouen", 0, 6)];
/** Missão (s4): vilarejo → Orléans → Reims, tracejada. */
export const MISSION: Vec3[] = [loc("village", -3, 9), loc("orleans", 0, 0), loc("reims", 0, 0)];
