import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { CatmullRomCurve3, ExtrudeGeometry, Shape, ShapeGeometry, Vector3 } from "three";
import map from "../data/france.json";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { ENG, FRA } from "./Medieval";

// Mapa-maquete do norte da França (contorno real Natural Earth, projetado em u3d: x = leste, z = sul).
// ESQUEMÁTICO: distâncias comprimidas; as estações (miniaturas) ficam por cima, na régua própria.

type P2 = number[];
export const LAND_H = 0.12;
export const CITIES = map.cities as unknown as Record<string, [number, number]>;
/** Posição 3D de uma cidade no topo do mapa (com deslocamento opcional, p/ separar estações próximas). */
export const city = (k: string, dx = 0, dz = 0): Vec3 => [CITIES[k][0] + dx, LAND_H, CITIES[k][1] + dz];

const toShape = (ring: P2[]) => {
  const s = new Shape();
  ring.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  return s;
};

const inside = (pt: P2, ring: P2[]) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i];
    const [xj, zj] = ring[j];
    if (zi > pt[1] !== zj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};

const Tint: React.FC<{ rings: P2[][]; color: string; k: number }> = ({ rings, color, k }) => {
  const geos = useMemo(() => rings.map((r) => new ShapeGeometry(toShape(r))), [rings]);
  if (k < 0.01) return null;
  return (
    <group position={[0, LAND_H + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} receiveShadow>
          <meshStandardMaterial color={color} transparent opacity={0.55 * clamp(k, 0, 1)} roughness={1} depthWrite={false} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
        </mesh>
      ))}
    </group>
  );
};

const River: React.FC<{ pts: P2[] }> = ({ pts }) => {
  const curve = useMemo(() => new CatmullRomCurve3(pts.map(([x, z]) => new Vector3(x, LAND_H + 0.05, z))), [pts]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 80, 0.07, 5, false]} />
      <meshStandardMaterial color="#5d9cc9" roughness={0.4} emissive="#2d5d8a" emissiveIntensity={0.2} />
    </mesh>
  );
};

/** Rota da viagem (fenda de luz roxa) desenhada até a fração `draw` (0..1) da lista de pontos. */
export const Route: React.FC<{ pts: Vec3[]; draw: number; color?: string; glow?: number; dashed?: boolean }> = ({ pts, draw, color = "#a78bfa", glow = 0, dashed = false }) => {
  const curve = useMemo(() => new CatmullRomCurve3(pts.map((p) => new Vector3(p[0], p[1] + 0.06, p[2])), false, "centripetal"), [pts]);
  const d = clamp(draw, 0, 1);
  if (d < 0.005) return null;
  const n = Math.max(2, Math.round(160 * d));
  const line = Array.from({ length: n + 1 }, (_, i) => curve.getPoint((i / n) * d));
  return (
    <group renderOrder={5}>
      <Line points={line} color={color} lineWidth={7 + glow * 5} dashed={dashed} dashSize={0.35} gapSize={0.22} transparent opacity={0.95} depthTest={false} renderOrder={5} />
      <Line points={line} color="#f5f0ff" lineWidth={2.4} transparent opacity={0.9} depthTest={false} renderOrder={6} />
      <mesh position={line[line.length - 1]}>
        <sphereGeometry args={[0.16 + glow * 0.08, 12, 8]} />
        <meshStandardMaterial color="#f5f0ff" emissive="#a78bfa" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
};

export const FranceMap: React.FC<{ eng?: number; fra?: number; border?: number }> = ({ eng = 0, fra = 0, border = 1 }) => {
  const [[x0, z0], [x1, z1]] = map.box as [P2, P2];
  const landGeos = useMemo(() => (map.land as P2[][]).map((r) => new ExtrudeGeometry(toShape(r), { depth: LAND_H, bevelEnabled: false })), []);
  const fr = map.france as P2[][];
  const frGeos = useMemo(() => fr.map((r) => new ShapeGeometry(toShape(r))), [fr]);
  // bosques: tufos de árvores em pontos semeados dentro da França, longe das cidades
  const woods = useMemo(() => {
    const out: { p: Vec3; s: number; c: string }[] = [];
    for (let i = 0; out.length < 70 && i < 900; i++) {
      const x = x0 + rand(`wx${i}`) * (x1 - x0);
      const z = z0 + rand(`wz${i}`) * (z1 - z0);
      if (!fr.some((r) => inside([x, z], r))) continue;
      if (Object.values(CITIES).some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 1.6)) continue;
      out.push({ p: [x, LAND_H, z], s: 0.12 + rand(`ws${i}`) * 0.1, c: rand(`wc${i}`) < 0.5 ? "#4f7a3e" : "#5f8a46" });
    }
    return out;
  }, [fr, x0, x1, z0, z1]);
  return (
    <group>
      {/* mar */}
      <mesh position={[(x0 + x1) / 2, -0.02, (z0 + z1) / 2]} receiveShadow>
        <boxGeometry args={[x1 - x0, 0.04, z1 - z0]} />
        <meshStandardMaterial color="#3c6482" roughness={0.5} emissive="#1d3550" emissiveIntensity={0.15} />
      </mesh>
      {/* terra (vizinhos em tom neutro) */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {landGeos.map((g, i) => (
          <mesh key={i} geometry={g} castShadow receiveShadow>
            <meshStandardMaterial color="#9a9a7c" roughness={1} flatShading />
          </mesh>
        ))}
      </group>
      {/* França por cima, em verde-campo */}
      <group position={[0, LAND_H + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {frGeos.map((g, i) => (
          <mesh key={i} geometry={g} receiveShadow>
            <meshStandardMaterial color="#9bb377" roughness={1} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
          </mesh>
        ))}
      </group>
      <Tint rings={map.tintEng as P2[][]} color={ENG} k={eng} />
      <Tint rings={map.tintFr as P2[][]} color={FRA} k={fra} />
      {border > 0.01
        ? fr.map((r, i) => <Line key={i} points={r.map(([x, z]) => [x, LAND_H + 0.045, z] as [number, number, number])} color="#f3ead2" lineWidth={2.2} transparent opacity={0.8 * border} />)
        : null}
      <River pts={map.loire as P2[]} />
      <River pts={map.seine as P2[]} />
      {woods.map((w, i) => (
        <mesh key={i} position={[w.p[0], w.p[1] + w.s * 1.2, w.p[2]]} castShadow>
          <coneGeometry args={[w.s, w.s * 2.6, 5]} />
          <meshStandardMaterial color={w.c} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
};
