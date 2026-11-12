import { onGlobe } from "../components/Kola";
import { worldScale } from "../components/Person";
import type { Vec3 } from "../utils/animation";

// Geometria do mundo do "buraco mais fundo" (u3d). Ver scene-plan / roteiro §1.
/** Superfície: 1 m = U u3d (pessoa 1,7 m = 0,051 u3d). */
export const U = 0.03;
export const PS = worldScale(U).person;
export const MS = worldScale(U).mascot;
/** Espessura da placa de tundra (6 m) → topo da coluna logo abaixo dela. */
export const Y0 = -6 * U;
/** Coluna esquemática: 1 km = KM u3d. */
export const KM = 2;
export const depthY = (km: number) => Y0 - KM * km;
/** Boca do poço na estação (metros locais x=0, z=9,5) → a face da frente da coluna passa por ela. */
export const MOUTH: Vec3 = [0, 0.4 * U, 9.5 * U];
export const COL_D = 1.2;
export const FACE_Z = MOUTH[2];
export const COL_Z = FACE_Z - COL_D / 2;
export const BOTTOM_KM = 12.262;
export const Y = { everest: depthY(8.849), marianas: depthY(10.935), bottom: depthY(BOTTOM_KM), fossils: depthY(6.7), water: depthY(4.5) };
/** Régua de escala (1 km = 0,25 u3d), nível do mar em y = 0. */
export const SCALE_POS: Vec3 = [12, 0, 0];
/** Globo (raio 3). */
export const GLOBE: Vec3 = [-14, 0, 0];
export const GLOBE_R = 3;
export const KOLA_LL = [30.6, 69.4] as const; // SG-3: 69,4° N, 30,6° E
export const SIBERIA_LL = [100, 62] as const;
const g = (ll: readonly [number, number], r = GLOBE_R): Vec3 => {
  const p = onGlobe(ll[0], ll[1], r);
  return [GLOBE[0] + p[0], GLOBE[1] + p[1], GLOBE[2] + p[2]];
};
export const KOLA_W = g(KOLA_LL);
export const SIBERIA_W = g(SIBERIA_LL);
