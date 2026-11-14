import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { add, ANANAS_P, CMP_120, CMP_90, CMP_BIG, FLOWER, FLOWER_TILT, NAUTILUS, PAIR_POS, PAIRS, PINE_P, RABBITS, SQUARES } from "../data/fibo";
import { LIGHTING } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { FibSquares, Nautilus, Pineapple, PineCone, Rabbit, SeedHead, Sunflower } from "./Fibo";
import { MascotFromTracks } from "./Mascot";

// Mundos da "espiral de Fibonacci": girassol, coelhos, quadrados, comparação de ângulos, pinha/abacaxi e náutilo.
// Tudo lê track("alvo.prop", frameGlobal). Posições em data/fibo.ts.

/** Luz que acompanha o alvo da câmera (a sombra cobre só o que está em quadro). */
export const KolaLighting: React.FC = () => {
  const f = useCurrentFrame();
  const pose = cameraPoseAt(f);
  const d = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const ext = clamp(d * 0.55, 0.4, 12);
  const myth = 0;
  const k = 1 - 0.3 * myth;
  const t = pose.target;
  const L: Vec3 = [t[0] + ext * 1.2, t[1] + ext * 2.2, t[2] + ext * 1.4];
  return (
    <>
      <ambientLight intensity={LIGHTING.ambient * k} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity * k]} />
      <directionalLight
        position={L}
        target-position={t}
        intensity={LIGHTING.key.intensity * k}
        color={new Color(LIGHTING.key.color).lerp(new Color("#ff9a7a"), myth * 0.5)}
        castShadow
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-ext}
        shadow-camera-near={0.01}
        shadow-camera-far={ext * 8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02 * Math.max(0.05, ext / 4)}
        shadow-radius={3}
      />
      <directionalLight position={LIGHTING.fill.position} intensity={LIGHTING.fill.intensity * k} color={LIGHTING.fill.color} />
      <directionalLight position={LIGHTING.rim.position} intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} />
    </>
  );
};


const show = (k: string, f: number) => track(`${k}.show`, f) > 0.5;
const M = { roughness: 0.8, metalness: 0, flatShading: true } as const;

/** Girassol de frente com caule e folhas no mundo. */
const FlowerWorld: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 70) * 0.03;
  return (
    <group position={FLOWER} rotation={[0, 0, sway]}>
      <group rotation={[FLOWER_TILT, 0, 0]}>
        <group rotation={[0, f * 0.0025, 0]}>
          <Sunflower f={f} stem={false} grow={track("flower.grow", f, 1)} famA={track("flower.famA", f)} famB={track("flower.famB", f)} />
        </group>
      </group>
      <mesh position={[0, -6.2, -0.7]} rotation={[0.04, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 11, 10]} />
        <meshStandardMaterial color="#4a8a3a" {...M} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 1.25, -5.4 - (k + 1) * 0.6, -0.55]} rotation={[0.1, 0, k * -0.55]} scale={[1.3, 0.55, 0.06]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#3f7a32" {...M} />
        </mesh>
      ))}
    </group>
  );
};

/** Gramado com os casais de coelhos (1, 1, 2, 3, 5). rabbits.n = etapa 1..5. */
const RabbitWorld: React.FC<{ f: number }> = ({ f }) => {
  const stage = clamp(track("rabbits.n", f), 0, 5);
  // casal i aparece na etapa (1-based) em que PAIRS passa de i
  const appear = (i: number) => clamp(stage - PAIRS.findIndex((p) => p > i), 0, 1);
  return (
    <group position={RABBITS}>
      <mesh position={[0, -0.08, 0.4]} receiveShadow>
        <cylinderGeometry args={[3.6, 3.8, 0.16, 40]} />
        <meshStandardMaterial color="#5a8a3a" {...M} />
      </mesh>
      {Array.from({ length: 26 }, (_, i) => {
        const a = rand(`ga${i}`) * Math.PI * 2;
        const r = 0.8 + rand(`gr${i}`) * 2.7;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.05, 0.4 + Math.sin(a) * r]} rotation={[0, a, 0]}>
            <coneGeometry args={[0.05, 0.22, 4]} />
            <meshStandardMaterial color={i % 3 ? "#6fa04a" : "#86b85a"} {...M} />
          </mesh>
        );
      })}
      {[[-2.6, 0.2, -1.6], [2.7, 0.2, -1.2], [2.5, 0.2, 2.2]].map((p, i) => (
        <mesh key={`b${i}`} position={p as Vec3} scale={[0.55, 0.45, 0.55]} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#3f7a32" {...M} />
        </mesh>
      ))}
      {PAIR_POS.map((p, i) => {
        const g = appear(i);
        if (g <= 0.01) return null;
        const sc = Math.min(1, g * 1.25) * (1 + 0.15 * Math.sin(g * Math.PI));
        return (
          <group key={i} position={p} scale={sc * 0.8} rotation={[0, rand(`rr${i}`) * 1.2 - 0.6, 0]}>
            <group position={[-0.32, 0, 0.1]}>
              <Rabbit f={f + i * 7} hop={g < 1 ? 1 : 0} />
            </group>
            <group position={[0.38, 0, -0.12]} rotation={[0, Math.PI - 0.4, 0]}>
              <Rabbit f={f + i * 11} color="#b88a5a" hop={g < 1 ? 1 : 0} />
            </group>
          </group>
        );
      })}
    </group>
  );
};

const Plinth: React.FC<{ p: Vec3; r?: number }> = ({ p, r = 0.9 }) => (
  <mesh position={p} receiveShadow castShadow>
    <cylinderGeometry args={[r, r * 1.08, 0.3, 32]} />
    <meshStandardMaterial color="#1c1630" roughness={0.6} />
  </mesh>
);

const CompareWorld: React.FC<{ f: number }> = ({ f }) => {
  const k = clamp(track("cmp.k", f), 0, 1);
  const bad = clamp(track("cmp.bad", f), 0, 1);
  const head = (p: Vec3, R: number, n: number, deg: number, red: number) => (
    <group position={p} rotation={[Math.PI / 2, 0, 0]} scale={0.4 + 0.6 * k}>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[R * 1.08, R * 1.08, 0.08, 48]} />
        <meshStandardMaterial color={new Color("#1e1208").lerp(new Color("#8a1a14"), red * 0.85)} roughness={0.8} />
      </mesh>
      <SeedHead n={n} R={R} angle={(deg * Math.PI) / 180} dome={0.1} />
    </group>
  );
  return (
    <group>
      {head(CMP_BIG, 1.5, 500, 137.50776, 0)}
      {head(CMP_120, 1.05, 260, 120, bad)}
      {head(CMP_90, 1.05, 260, 90, bad)}
    </group>
  );
};

const PlantsWorld: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <Plinth p={add(PINE_P, [0, -1.45, 0])} r={0.95} />
    <Plinth p={add(ANANAS_P, [0, -1.35, 0])} r={1.0} />
    <group position={PINE_P} rotation={[0, f * 0.012, 0]}>
      <PineCone hi={track("plant.hiA", f)} s={0.95} />
    </group>
    <group position={ANANAS_P} rotation={[0, -f * 0.012, 0]}>
      <Pineapple hi={track("plant.hiB", f)} f={f} s={0.95} />
    </group>
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("flower", f) ? <FlowerWorld f={f} /> : null}
      {show("rabbits", f) ? <RabbitWorld f={f} /> : null}
      {show("squares", f) ? (
        <group position={SQUARES}>
          <FibSquares n={track("squares.n", f)} draw={track("spiral.draw", f)} k={0.3} />
        </group>
      ) : null}
      {show("compare", f) ? <CompareWorld f={f} /> : null}
      {show("plants", f) ? <PlantsWorld f={f} /> : null}
      {show("nautilus", f) ? (
        <group position={NAUTILUS} rotation={[0, Math.sin(f / 60) * 0.12, 0]}>
          <Nautilus golden={track("golden", f)} s={1.05} />
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
