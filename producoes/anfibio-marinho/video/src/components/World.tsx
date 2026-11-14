import { useMemo } from "react";
import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { BONE, LAB, MAP, POND, SEA, SEA_SHORE_X, SKIN } from "../data/amph";
import { LIGHTING } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { Fish } from "./Animals";
import { FossilSlab, Frog, Gerrothorax, Ichthyosaur, Salamander, SkinBlock } from "./Amphibia";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { BoneSection } from "./Sangue";

// Mundos do "único anfíbio que vivia no mar". Tudo lê track("alvo.prop", frameGlobal). Posições em data/amph.ts.

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
const M = { roughness: 0.85, metalness: 0, flatShading: true } as const;

const PondWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={POND}>
    {/* terra / grama */}
    <mesh position={[-0.6, -0.05, 0]} receiveShadow>
      <boxGeometry args={[4.4, 0.1, 3]} />
      <meshStandardMaterial color="#5a8a3a" {...M} />
    </mesh>
    {/* lagoa */}
    <mesh position={[-0.75, 0.002, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.55, 32]} />
      <meshStandardMaterial color="#3a7a8a" roughness={0.2} metalness={0.1} />
    </mesh>
    <mesh position={[-0.8, 0.008, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.12, 16]} />
      <meshStandardMaterial color="#4a9a3a" {...M} side={2} />
    </mesh>
    <group position={[-0.8, 0.008, 0.05]} rotation={[0, 0.8, 0]}>
      <Frog f={f} color="#7ac04a" />
    </group>
    {/* areia + mar */}
    <mesh position={[SEA_SHORE_X + 0.15, -0.04, 0]} receiveShadow>
      <boxGeometry args={[0.6, 0.08, 3]} />
      <meshStandardMaterial color="#d8c08a" {...M} />
    </mesh>
    <mesh position={[SEA_SHORE_X + 2.4, -0.03 + 0.01 * Math.sin(f / 12), 0]}>
      <boxGeometry args={[4, 0.06, 3]} />
      <meshStandardMaterial color="#2a6aa8" roughness={0.25} metalness={0.1} />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[SEA_SHORE_X + 0.6 + (i % 5) * 0.7, 0.012 + 0.01 * Math.sin(f / 10 + i), -1.2 + Math.floor(i / 5) * 1.4 + 0.3 * Math.sin(i)]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 16, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#dff2ff" transparent opacity={0.6} side={2} />
      </mesh>
    ))}
    {/* pedras e plantinhas */}
    {[[-1.8, 0.08, -0.8, 0.18], [0.7, 0.06, -0.9, 0.14], [-0.1, 0.05, 1.0, 0.1]].map(([x, y, z, s], i) => (
      <mesh key={`r${i}`} position={[x, y, z]} scale={s} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8a8a80" {...M} />
      </mesh>
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={`g${i}`} position={[-2.2 + rand(`pg${i}`) * 3.4, 0.05, -1.2 + rand(`pz${i}`) * 2.4]} rotation={[0, rand(`pr${i}`) * 3, 0.1 * Math.sin(f / 20 + i)]}>
        <coneGeometry args={[0.03, 0.18, 4]} />
        <meshStandardMaterial color="#6fa04a" {...M} />
      </mesh>
    ))}
    <group position={[-0.2, 0, 0.45]} rotation={[0, -0.6, 0]}>
      <Frog f={f} hop={0} />
    </group>
    <group position={[0.35, 0, 0.1]} rotation={[0, 2.6, 0]}>
      <Salamander f={f} />
    </group>
  </group>
);

const SkinWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={SKIN}>
    <SkinBlock f={f} flow={track("skin.in", f)} out={track("skin.out", f)} salt={track("salt", f)} />
    <group position={[2.1, 0.33, 0.1]} rotation={[0, -0.7, 0]} scale={4}>
      <Frog f={f} shrink={track("shrink", f, 1)} color={new Color("#4f9a3a").lerp(new Color("#9a9a5a"), 1 - track("shrink", f, 1)).getStyle()} />
    </group>
  </group>
);

const LabWorld: React.FC<{ f: number }> = ({ f }) => {
  const fk = clamp(track("fossil.k", f), 0, 1.2);
  const rk = clamp(track("ruler.k", f), 0, 1.2);
  const ak = clamp(track("armor.k", f), 0, 1);
  return (
    <group position={LAB}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.12, 2.0]} />
        <meshStandardMaterial color="#5a3e2a" roughness={0.7} />
      </mesh>
      <group position={[-0.65, 0, 0]} scale={fk}>
        <FossilSlab seed="a" />
      </group>
      <group position={[0.68, 0, -0.08]} rotation={[0, 0.12, 0]} scale={fk}>
        <FossilSlab seed="b" />
      </group>
      {rk > 0.01 ? (
        <group position={[-1.15, 0.0, 0.5]} scale={[rk, 1, 1]}>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1, 0.012, 0.06]} />
            <meshStandardMaterial color="#f2d24a" roughness={0.5} />
          </mesh>
          {Array.from({ length: 11 }, (_, i) => (
            <mesh key={i} position={[i * 0.1, 0.008, -0.012]}>
              <boxGeometry args={[0.006, 0.004, i % 5 === 0 ? 0.04 : 0.022]} />
              <meshBasicMaterial color="#1a1208" />
            </mesh>
          ))}
        </group>
      ) : null}
      {ak > 0.01 ? (
        <group position={[-0.67, 0.03 + 0.06 * (1 - ak), 0]} scale={0.8 + 0.2 * ak}>
          <Gerrothorax f={f} armor={ak} gills={ak} />
        </group>
      ) : null}
    </group>
  );
};

/** Fundo do mar triássico: areia, pedras, algas, raios de luz, partículas; Gerrothorax no centro. */
const SeaWorld: React.FC<{ f: number }> = ({ f }) => {
  const sil = track("sil", f);
  const ghost = track("gerro.ghost", f);
  const drift = clamp(track("drift.t", f), 0, 1);
  const bury = clamp(track("bury", f), 0, 1);
  const prey = clamp(track("prey.t", f), 0, 1);
  const deco = useMemo(() => ({
    rocks: Array.from({ length: 22 }, (_, i) => ({ p: [(rand(`sx${i}`) - 0.5) * 10, 0, -1 - rand(`sz${i}`) * 6] as Vec3, s: 0.1 + rand(`ss${i}`) * 0.35 })),
    weeds: Array.from({ length: 26 }, (_, i) => ({ p: [(rand(`wx${i}`) - 0.5) * 9, 0, -0.6 - rand(`wz${i}`) * 5] as Vec3, h: 0.4 + rand(`wh${i}`) * 0.9 })),
    motes: Array.from({ length: 60 }, (_, i) => ({ p: [(rand(`mx${i}`) - 0.5) * 8, 0.2 + rand(`my${i}`) * 3, (rand(`mz${i}`) - 0.5) * 6] as Vec3 })),
  }), []);
  const showMain = drift < 0.01 && (ghost < 0.5 || sil > 0.01);
  return (
    <group position={SEA}>
      <mesh position={[0, -0.03, -1.5]} receiveShadow>
        <boxGeometry args={[14, 0.06, 10]} />
        <meshStandardMaterial color="#8f8462" roughness={1} />
      </mesh>
      {deco.rocks.map((r, i) => (
        <mesh key={`r${i}`} position={r.p} scale={[r.s * 1.3, r.s * 0.7, r.s]} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 3 ? "#6a6a62" : "#7a6e5a"} {...M} />
        </mesh>
      ))}
      {deco.weeds.map((w, i) => (
        <group key={`w${i}`} position={w.p} rotation={[0.12 * Math.sin(f / 25 + i), 0, 0.12 * Math.cos(f / 30 + i)]}>
          <mesh position={[0, w.h / 2, 0]}>
            <coneGeometry args={[0.04, w.h, 4]} />
            <meshStandardMaterial color={i % 2 ? "#3a7a4a" : "#5a8a3a"} {...M} />
          </mesh>
        </group>
      ))}
      {deco.motes.map((m, i) => (
        <mesh key={`m${i}`} position={[m.p[0] + 0.1 * Math.sin(f / 40 + i), m.p[1] + ((f * 0.002 + i * 0.1) % 1) * 0.3, m.p[2]]}>
          <sphereGeometry args={[0.012, 4, 3]} />
          <meshBasicMaterial color="#cfe8ff" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* raios de luz */}
      {[-1.5, 0.4, 2.2].map((x, i) => (
        <mesh key={`ray${i}`} position={[x, 2.2, -2]} rotation={[0, 0, 0.25]}>
          <planeGeometry args={[0.6, 5]} />
          <meshBasicMaterial color="#9fd0ff" transparent opacity={0.06 + 0.02 * Math.sin(f / 30 + i)} depthWrite={false} />
        </mesh>
      ))}
      {showMain ? (
        <group position={[0, 0.005 - bury * 0.035, 0]} rotation={[0, Math.sin(f / 80) * 0.15, 0]} scale={ghost > 0.5 ? 0.7 + 0.3 * sil : 1}>
          <Gerrothorax f={f} swim={bury > 0.5 ? 0 : 0.6} armor={1} mouth={prey > 0.7 ? 1 : prey * 0.6} ghost={ghost > 0.5 ? 1 : 0} gills={1} />
          {bury > 0.01
            ? Array.from({ length: 30 }, (_, i) => {
                const a = (i / 30) * Math.PI * 2;
                return (
                  <mesh key={i} position={[Math.cos(a) * 0.33 - 0.02, 0.01, Math.sin(a) * 0.24]} scale={[0.05 * bury, 0.025 * bury, 0.05 * bury]}>
                    <sphereGeometry args={[1, 6, 4]} />
                    <meshStandardMaterial color="#b8a47a" roughness={1} />
                  </mesh>
                );
              })
            : null}
        </group>
      ) : null}
      {/* flashback: corpo levado pela correnteza */}
      {drift > 0.01 ? (
        <>
          {Array.from({ length: 24 }, (_, i) => {
            const x = -3.5 + (((i * 0.33 + f * 0.04) % 8) + 8) % 8;
            return (
              <mesh key={`c${i}`} position={[x, 0.4 + (i % 4) * 0.25, -0.6 + (i % 3) * 0.5]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.03, 0.22, 4]} />
                <meshBasicMaterial color="#9fd0ff" transparent opacity={0.5} />
              </mesh>
            );
          })}
          <group position={[-2.6 + drift * 5.2, 0.6 + 0.08 * Math.sin(f / 10), 0]} rotation={[Math.PI * 0.9, drift * 0.8, 0.2 * Math.sin(f / 14)]}>
            <Gerrothorax f={f} armor={1} gills={0.4} />
          </group>
        </>
      ) : null}
      {/* presa sugada */}
      {prey > 0.01 && prey < 0.98 ? <Fish frame={f} position={[0.95 - prey * 0.55, 0.12 - prey * 0.06, 0.05]} rotY={Math.PI} scale={0.28 * (1 - prey * 0.85)} color="#f2a24a" /> : null}
      {/* escudo (hipótese): bolhas azuis presas em volta do corpo */}
      {track("shield.k", f) > 0.01
        ? Array.from({ length: 26 }, (_, i) => {
            const a = (i / 26) * Math.PI * 2;
            const k = clamp(track("shield.k", f), 0, 1.2);
            return (
              <mesh key={`sh${i}`} position={[Math.cos(a) * 0.34, 0.07 + 0.02 * Math.sin(f / 6 + i), Math.sin(a) * 0.26]} scale={0.022 * k}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color="#4aa8ff" roughness={0.2} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

const MapWorld: React.FC<{ f: number }> = ({ f }) => {
  const k = clamp(track("coast.k", f), 0, 1);
  const coast = -2.5 - k * 4.5;
  const it = clamp(track("ichthy.t", f), 0, 1);
  return (
    <group position={MAP}>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[18, 0.3, 14]} />
        <meshStandardMaterial color="#2a5a9a" roughness={0.3} />
      </mesh>
      <mesh position={[(coast - 9) / 2, 0.15, 0]}>
        <boxGeometry args={[coast + 9, 0.5, 14]} />
        <meshStandardMaterial color="#8a7a4a" {...M} />
      </mesh>
      {/* pino do fóssil */}
      <group position={[3.5, 0, 0.5]}>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.35, 16, 12]} />
          <meshStandardMaterial color="#ff5a4a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.18, 0.6, 12]} />
          <meshStandardMaterial color="#ff5a4a" roughness={0.4} />
        </mesh>
      </group>
      {/* linha de distância */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = coast + 0.3 + (i / 15) * (3.2 - coast - 0.3);
        return i % 2 ? null : (
          <mesh key={i} position={[x, 0.05, 0.5]}>
            <boxGeometry args={[0.35, 0.05, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      })}
      {it > 0.01 ? (
        <group position={[-7 + it * 14, 1.2 + 0.15 * Math.sin(f / 9), -2]} scale={2.2}>
          <Ichthyosaur f={f} />
        </group>
      ) : null}
    </group>
  );
};

const BoneWorld: React.FC<{ f: number }> = ({ f }) => {
  const g = clamp(track("sr.glow", f), 0, 1);
  const atoms = useMemo(() => Array.from({ length: 40 }, (_, i) => {
    const a = rand(`at${i}`) * Math.PI * 2;
    const r = 0.5 + rand(`ar${i}`) * 0.85;
    return [Math.cos(a) * r, 0.3, Math.sin(a) * r] as Vec3;
  }), []);
  return (
    <group position={BONE}>
      <BoneSection f={f} flow={0} r={1.4} />
      {g > 0.01
        ? atoms.map((p, i) => (
            <mesh key={i} position={p} scale={0.06 * g * (1 + 0.2 * Math.sin(f / 5 + i))}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshBasicMaterial color="#ffcf3a" toneMapped={false} />
            </mesh>
          ))
        : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("pond", f) ? <PondWorld f={f} /> : null}
      {show("skin", f) ? <SkinWorld f={f} /> : null}
      {show("lab", f) ? <LabWorld f={f} /> : null}
      {show("sea", f) ? <SeaWorld f={f} /> : null}
      {show("map", f) ? <MapWorld f={f} /> : null}
      {show("bone", f) ? <BoneWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
