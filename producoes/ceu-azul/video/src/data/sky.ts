import { lerp, rand, type Vec3 } from "../utils/animation";

// Geometria do mundo "céu azul" (u3d). Régua do chão: 1 m = 0,3 u3d.
// A atmosfera é uma meia-cúpula ACHATADA (bem mais larga que alta), como a de verdade é fina perto do
// tamanho da Terra: assim o caminho da luz do Sol baixo dentro do ar fica bem mais longo que o do meio-dia.

export const U_PER_M = 0.3;
/** Ponto dos olhos dos observadores (entre a pessoa e o mascote, no topo do morro). */
export const EYE: Vec3 = [0.65, 1.0, 0.7];
export const DOME = { rx: 4.4, ry: 2.3, rz: 2.0 };
export const HILL = { c: [0.6, 0, 0.6] as Vec3, r: [1.5, 0.62, 1.4] as Vec3 };

/** Altura do morro (topo da superfície) em x,z. */
export const hillY = (x: number, z: number) => {
  const dx = (x - HILL.c[0]) / HILL.r[0];
  const dz = (z - HILL.c[2]) / HILL.r[2];
  const q = 1 - dx * dx - dz * dz;
  return q > 0 ? HILL.r[1] * Math.sqrt(q) : 0;
};

/** Sol no arco: a = 0 meio-dia (alto), a = 1 pôr do sol (no horizonte, à esquerda). */
export const sunPos = (a: number): Vec3 => {
  const th = lerp(0.165, 1.484, a);
  return [-4.6 * Math.sin(th), 5.4 * Math.cos(th), -0.5];
};
/** "Sol do meio-dia" usado na comparação (espelhado à direita, para os dois caminhos não se cruzarem). */
export const NOON_SUN: Vec3 = [1.46, 5.12, -0.5];

export const insideDome = (p: Vec3) => (p[0] / DOME.rx) ** 2 + (p[1] / DOME.ry) ** 2 + (p[2] / DOME.rz) ** 2 <= 1 && p[1] >= 0;

export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Parâmetro (0..1) em que a reta a→b entra na cúpula. */
export const domeEntry = (a: Vec3, b: Vec3) => {
  for (let i = 0; i <= 80; i++) {
    const u = i / 80;
    if (insideDome(lerp3(a, b, u))) return u;
  }
  return 1;
};

// Prisma da cena 3 (logo abaixo do Sol da manhã).
export const PRISM: Vec3 = [-0.81, 4.07, 0.2];

// Aglomerado de moléculas mostrado em zoom (no caminho da luz, dentro do ar).
export const CLUSTER: Vec3 = [0.27, 1.74, 0.5];
export const CLUSTER_N = 12;
/** i < 9: N₂ (78% do ar); demais: O₂. */
export const isN2 = (i: number) => i < 9;
export const clusterMolecule = (i: number, frame: number): Vec3 => {
  const ox = (rand(`cm-x${i}`) - 0.5) * 2.2;
  const oy = (rand(`cm-y${i}`) - 0.5) * 1.5;
  const oz = (rand(`cm-z${i}`) - 0.5) * 0.9;
  const ph = rand(`cm-p${i}`) * 6.28;
  return [CLUSTER[0] + ox + 0.04 * Math.sin(frame / 23 + ph), CLUSTER[1] + oy + 0.04 * Math.cos(frame / 29 + ph), CLUSTER[2] + oz];
};

/** Pontos na cúpula de onde a luz azul chega aos olhos (cena 6). */
export const EYE_RAY_POINTS: Vec3[] = Array.from({ length: 12 }, (_, i) => {
  // frente da cúpula (z > 0), da direita para a esquerda, em alturas variadas
  const phi = Math.PI * (0.06 + 0.88 * (i / 11)) + (rand(`er-a${i}`) - 0.5) * 0.1;
  const e = 0.3 + 0.9 * rand(`er-e${i}`);
  const k = 0.96;
  return [DOME.rx * k * Math.cos(e) * Math.cos(phi), DOME.ry * k * Math.sin(e), DOME.rz * k * Math.cos(e) * Math.sin(phi) * 0.6 - 0.2];
});
