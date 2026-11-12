import { useMemo } from "react";
import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { BOTTOM_KM, COL_D, COL_Z, depthY, FACE_Z, GLOBE, GLOBE_R, KM, KOLA_LL, KOLA_W, MOUTH, PS, SCALE_POS, SIBERIA_LL, U, Y0 } from "../data/kola";
import { LIGHTING } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { BoreholeMouth, Coins, Drill, DrillStation, EarthGlobe, GlobePin, Magnifier, Microfossil, Microphone, RockColumn, RustyCap, ScaleBoard, Tundra } from "./Kola";
import { MascotFromTracks } from "./Mascot";
import { crowdLooks, Person } from "./Person";

// Cenário persistente do "buraco mais fundo": estação na tundra, coluna de rocha com a broca, régua de escala e globo.
// Tudo lê o estado de track("alvo.prop", frameGlobal). Réguas em data/kola.ts.

/** Luz que acompanha o alvo da câmera (a sombra cobre só o que está em quadro). */
export const KolaLighting: React.FC = () => {
  const f = useCurrentFrame();
  const pose = cameraPoseAt(f);
  const d = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const ext = clamp(d * 0.55, 0.4, 12);
  const myth = track("myth.k", f);
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

const WORKER = (i: number) => ({ ...crowdLooks(6, "kola-inverno")[i], shirt: ["#3f4a5c", "#5a4a3a", "#2f4d4a", "#4b3f5a", "#4a4f3a"][i % 5], sleeves: "long" as const, pants: "#2c2f38", helmet: "sallet" as const, helmetColor: "#f2b01e" });
/** operários (metros locais da estação): posição inicial, rumo e quanto andam ao ir embora */
const CREW: { p: Vec3; r: number }[] = [
  { p: [-4, 0.4, 13], r: 0.6 },
  { p: [3.5, 0.4, 12.5], r: -0.8 },
  { p: [6, 0.4, 16], r: -1.6 },
  { p: [-8, 0.4, 17], r: 1.2 },
  { p: [10, 0.4, 7], r: -2.4 },
];

/** Superfície: estação + tundra (a metade da frente desce quando a coluna "abre"), neve caindo, tampa, operários. */
const Surface: React.FC<{ f: number }> = ({ f }) => {
  const open = track("shaft.open", f);
  const ruin = track("station.ruin", f);
  const lights = track("station.lights", f);
  const leave = track("people.leave", f);
  const FZ = FACE_Z / U; // face da coluna em metros locais (9,5 m)
  const backD = 70 + FZ;
  const frontD = 70 - FZ;
  return (
    <group scale={U}>
      {/* metade de trás da tundra (fica) */}
      <group position={[0, 0, (FZ - 70) / 2]}>
        <Tundra w={180} d={backD} seed="tb" />
      </group>
      {/* metade da frente: desce e some quando a coluna abre */}
      {open < 0.98 ? (
        <group position={[0, -open * 60, (FZ + 70) / 2]}>
          <Tundra w={180} d={frontD} seed="tf" />
        </group>
      ) : null}
      {/* fio de luz roxa da marca na borda do corte */}
      <mesh position={[0, -6.2, FZ + 0.4]}>
        <boxGeometry args={[180, 0.5, 0.5]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2.2 * open} />
      </mesh>
      <DrillStation lights={lights} ruin={ruin} />
      {ruin < 0.5 ? (
        <group position={[0, 0.4, FZ]}>
          <BoreholeMouth ruler={track("ruler.show", f)} />
        </group>
      ) : null}
      {ruin > 0.5 ? (
        <group position={[0, 0.4, FZ]}>
          <RustyCap />
        </group>
      ) : null}
      {ruin < 0.5 && leave < 0.99
        ? CREW.map((c, i) => {
            const dx = leave * 26;
            const sc = leave > 0.85 ? (1 - leave) / 0.15 : 1;
            return <Person key={i} {...WORKER(i)} frame={f} position={[c.p[0] + dx, c.p[1], c.p[2] + (i % 2) * leave * 6]} rotY={leave > 0.02 ? Math.PI / 2 : c.r} scale={(PS / U) * sc} walk={leave > 0.02 && leave < 0.98 ? 1 : 0} seed={70 + i} />;
          })
        : null}
      <Snow f={f} />
    </group>
  );
};

/** flocos de neve caindo devagar ao redor da estação (metros locais) */
const Snow: React.FC<{ f: number }> = ({ f }) => {
  const flakes = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ x: (rand(`sx${i}`) - 0.5) * 120, z: (rand(`sz${i}`) - 0.5) * 90, y0: rand(`sy${i}`) * 70, sp: 0.6 + rand(`ss${i}`) * 0.8, s: 0.25 + rand(`sr${i}`) * 0.25 })), []);
  return (
    <group>
      {flakes.map((k, i) => {
        const y = 70 - ((k.y0 + f * 0.35 * k.sp) % 70);
        return (
          <mesh key={i} position={[k.x + Math.sin(f * 0.03 + i) * 1.5, y, k.z]}>
            <icosahedronGeometry args={[k.s, 0]} />
            <meshBasicMaterial color="#f5f8ff" />
          </mesh>
        );
      })}
    </group>
  );
};

/** Coluna de rocha + broca + microfone da lenda + paredes que se fecham + lupa com fósseis. */
const Column: React.FC<{ f: number }> = ({ f }) => {
  const open = track("shaft.open", f);
  const myth = track("myth.k", f);
  if (open < 0.01 && myth < 0.01) return null;
  const heat = track("rock.heat", f);
  const km = track("drill.km", f);
  const tries = track("drill.tries", f);
  const tipKm = km - 0.12 * Math.abs(Math.sin(tries * Math.PI)) * (tries > 0 && tries < 3 ? 1 : 0);
  const squeeze = track("walls.squeeze", f);
  const soft = track("rock.soft", f);
  const micKm = track("mic.km", f);
  const waves = track("myth.waves", f);
  const lens = track("lens.show", f);
  const fossils = track("fossils.reveal", f);
  const bottom = depthY(BOTTOM_KM);
  return (
    <group>
      <group position={[0, Y0, COL_Z]}>
        <RockColumn KM={KM} d={COL_D} heat={heat} myth={myth} cracks={track("cracks.open", f)} f={f} soft={soft} />
      </group>
      {/* broca (no plano do corte) */}
      {km > 0.01 ? (
        <group position={[0, 0, FACE_Z + 0.025]}>
          <Drill tip={depthY(tipKm)} top={MOUTH[1]} r={0.06} f={f} spin={track("drill.spin", f, 1)} heat={heat} />
        </group>
      ) : null}
      {/* rocha mole se fechando atrás da broca (s10–s11) */}
      {squeeze > 0.01 || soft > 0.01
        ? [-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * (0.07 + 0.42 * (1 - squeeze)), bottom + 0.75 + Math.sin(f * 0.08 + sd) * 0.03 * soft, FACE_Z + 0.03]} scale={[0.32 + 0.08 * soft, 0.8, 0.06]}>
              <sphereGeometry args={[1, 9, 7]} />
              <meshStandardMaterial color="#6e2410" emissive="#ff6a2a" emissiveIntensity={0.35 * Math.max(soft, squeeze)} flatShading />
            </mesh>
          ))
        : null}
      {/* microfone da lenda */}
      {myth > 0.01 && micKm > 0.05 ? (
        <group position={[0, 0, FACE_Z + 0.16]}>
          <Microphone y={depthY(micKm)} top={Y0} s={0.2} />
          {waves > 0.01
            ? [0, 1, 2].map((k) => {
                const ph = (f * 0.03 + k / 3) % 1;
                return (
                  <mesh key={k} position={[0, depthY(micKm), 0.02]} scale={0.25 + ph * 1.4}>
                    <torusGeometry args={[1, 0.035, 6, 32]} />
                    <meshBasicMaterial color="#ff4a2a" transparent opacity={waves * (1 - ph) * myth} />
                  </mesh>
                );
              })
            : null}
        </group>
      ) : null}
      {/* lupa com fósseis de plâncton (~6,7 km) */}
      {lens > 0.01 ? (
        <group position={[0.38, depthY(6.7), FACE_Z + 0.22]} scale={0.32 * clamp(lens, 0, 1.2)}>
          <Magnifier r={1} />
          {([0, 1, 2, 3, 4] as const).map((k, i) => (
            <group key={k} position={[[-0.45, 0.4, -0.05, 0.42, 0.05][i], [0.3, 0.28, -0.05, -0.32, -0.55][i], 0.1]} scale={clamp(fossils, 0, 1)}>
              <Microfossil kind={k} s={0.17} spin={f * 0.02 + i} />
            </group>
          ))}
        </group>
      ) : null}
    </group>
  );
};

/** Régua de escala (s6–s8). */
const Scale: React.FC<{ f: number }> = ({ f }) => {
  const ev = track("scale.everest", f);
  const kola = track("scale.kola", f);
  if (ev < 0.001 && kola < 0.001) return null;
  return (
    <group position={SCALE_POS}>
      <ScaleBoard everest={ev} marianas={track("scale.marianas", f)} kola={kola} oil={track("scale.oil", f)} f={f} />
    </group>
  );
};

/** Globo com pinos, linha do raio e corte em cunha (s3–s4, s12). */
const Globe: React.FC<{ f: number }> = ({ f }) => {
  const sib = track("pin.siberia", f);
  const kola = track("pin.kola", f);
  const cut = track("globe.cut", f);
  const radius = track("radius.draw", f);
  const pose = cameraPoseAt(f);
  const near = Math.hypot(pose.target[0] - GLOBE[0], pose.target[1] - GLOBE[1], pose.target[2] - GLOBE[2]) < 8;
  if (!near && sib < 0.01 && kola < 0.01 && cut < 0.01) return null;
  const dir = [KOLA_W[0] - GLOBE[0], KOLA_W[1] - GLOBE[1], KOLA_W[2] - GLOBE[2]].map((v) => v / GLOBE_R) as Vec3;
  const len = GLOBE_R * radius;
  const mid: Vec3 = [GLOBE[0] + dir[0] * (GLOBE_R - len / 2), GLOBE[1] + dir[1] * (GLOBE_R - len / 2), GLOBE[2] + dir[2] * (GLOBE_R - len / 2)];
  // rotação que leva +y até dir
  const ang = Math.acos(clamp(dir[1], -1, 1));
  const ax = [dir[2], 0, -dir[0]];
  const al = Math.hypot(ax[0], ax[2]) || 1;
  const q: [number, number, number, number] = [(ax[0] / al) * Math.sin(ang / 2), 0, (ax[2] / al) * Math.sin(ang / 2), Math.cos(ang / 2)];
  return (
    <group>
      <group position={GLOBE}>
        <EarthGlobe R={GLOBE_R} cut={cut} crustGlow={track("crust.glow", f)} />
        {kola > 0.01 ? (
          <group scale={clamp(kola, 0, 1.2)} position={[0, 0, 0]}>
            <GlobePin lon={KOLA_LL[0]} lat={KOLA_LL[1]} R={GLOBE_R} s={0.4} />
          </group>
        ) : null}
        {sib > 0.01 ? <GlobePin lon={SIBERIA_LL[0]} lat={SIBERIA_LL[1]} R={GLOBE_R} s={0.4 * clamp(sib, 0, 1.2)} color="#9aa1aa" cross={track("pin.siberiaCross", f)} /> : null}
      </group>
      {radius > 0.01 ? (
        <mesh position={mid} quaternion={q}>
          <cylinderGeometry args={[0.03, 0.03, len, 8]} />
          <meshBasicMaterial color="#f5f0ff" />
        </mesh>
      ) : null}
    </group>
  );
};

/** Moedas (s11), ao lado da estação. */
const Money: React.FC<{ f: number }> = ({ f }) => {
  const show = track("coins.show", f);
  if (show < 0.01) return null;
  return (
    <group position={[MOUTH[0] + 0.55, MOUTH[1] + 0.02, MOUTH[2] + 0.35]} scale={0.18 * clamp(show, 0, 1.2)}>
      <Coins level={track("coins.level", f, 1)} r={0.5} />
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      <Surface f={f} />
      <Column f={f} />
      <Scale f={f} />
      <Globe f={f} />
      <Money f={f} />
      <MascotFromTracks />
    </group>
  );
};
